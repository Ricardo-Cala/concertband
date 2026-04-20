import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Home, Music2, Users } from 'lucide-react'
import Header from './components/Header'
import FichaConcierto from './components/FichaConcierto'
import EditarConcierto from './components/EditarConcierto'
import NuevoConcierto from './components/NuevoConcierto'
import Grupo from './components/Grupo'

export default function App() {
  const [pantalla, setPantalla] = useState('inicio')
  const [amigos, setAmigos] = useState([])
  const [conciertos, setConciertos] = useState([])
  const [conciertoSeleccionado, setConciertoSeleccionado] = useState(null)
  const [conciertoEditando, setConciertoEditando] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)

  useEffect(() => {
    supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
    cargarConciertos()
    const canal = supabase
      .channel('cambios-globales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conciertos' }, () => cargarConciertos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transportes' }, () => cargarConciertos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hoteles' }, () => cargarConciertos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amigos' }, () => {
        supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
      })
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  useEffect(() => {
    let startY = 0
    let pulling = false

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY
      pulling = window.scrollY === 0
    }

    const onTouchEnd = async (e) => {
      if (!pulling) return
      const diff = e.changedTouches[0].clientY - startY
      if (diff > 80) {
        await cargarConciertos()
        await supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
      }
      pulling = false
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const cargarConciertos = async () => {
    const { data } = await supabase.from('conciertos').select(`*, transportes(*), hoteles(*)`).order('fecha')
    if (data) setConciertos(data)
  }

  const hoy = new Date(new Date().toDateString())
  const proximos = conciertos.filter(c => new Date(c.fecha) >= hoy)
  const pasados = conciertos.filter(c => new Date(c.fecha) < hoy).reverse()

  const tagEstado = (estado) => ({
    background: estado === 'confirmado' ? '#EAF3DE' : '#FAEEDA',
    color: estado === 'confirmado' ? '#27500A' : '#633806',
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500
  })

  const iconTransporte = (tipo) => {
    if (tipo === 'Avión') return '✈️'
    if (tipo === 'Coche') return '🚗'
    if (tipo === 'Autobús') return '🚌'
    if (tipo === 'AVE') return '🚄'
    return '🚆'
  }

  // TARJETA MEJORADA: sin borde izquierdo, con sombra suave
  const TarjetaConcierto = ({ c, opacidad = 1 }) => (
    <div onClick={() => setConciertoSeleccionado(c)} style={{
      background: 'white',
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      cursor: 'pointer',
      opacity: opacidad,
      transition: 'opacity 0.15s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      border: '1px solid rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{c.artista}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            {new Date(c.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {c.recinto}, {c.ciudad}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={tagEstado(c.estado)}>{c.estado}</span>
            {c.hora_apertura && (
              <span style={{ background: '#E1EAF5', color: '#1A3A5C', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                🕐 {c.hora_apertura.slice(0,5)}h
              </span>
            )}
            {c.transportes?.[0] && (
              <span style={{ background: '#EEEDFE', color: '#3C3489', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                {iconTransporte(c.transportes[0].tipo)} {c.transportes[0].tipo}
              </span>
            )}
            {c.hoteles?.[0] && (
              <span style={{ background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                🏨 {c.hoteles[0].nombre}
              </span>
            )}
          </div>
        </div>
        <span style={{ color: '#bbb', fontSize: 20, marginLeft: 8 }}>›</span>
      </div>
    </div>
  )

  const PantallaInicio = () => {
    const siguiente = proximos[0]
    const diasRestantes = siguiente ? Math.ceil((new Date(siguiente.fecha) - hoy) / (1000 * 60 * 60 * 24)) : null
    const [resumen, setResumen] = useState({ van: 0, entradas: 0, pendientePago: 0 })

    useEffect(() => {
      if (!siguiente) return
      Promise.all([
        supabase.from('asistentes').select('*').eq('concierto_id', siguiente.id).eq('confirmado', true),
        supabase.from('entradas').select('cantidad').eq('concierto_id', siguiente.id),
        supabase.from('gastos').select('id').eq('concierto_id', siguiente.id),
      ]).then(async ([a, e, g]) => {
        let pendientePago = 0
        if (g.data && g.data.length > 0) {
          const gastoIds = g.data.map(x => x.id)
          const { data: p } = await supabase.from('pagos').select('cantidad').in('gasto_id', gastoIds).eq('pagado', false)
          pendientePago = p?.reduce((s, x) => s + Number(x.cantidad), 0) || 0
        }
        setResumen({
          van: a.data?.length || 0,
          entradas: e.data?.reduce((s, x) => s + x.cantidad, 0) || 0,
          pendientePago,
        })
      })
    }, [siguiente?.id])

    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{conciertos.length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Conciertos totales</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{conciertos.filter(c => c.estado === 'confirmado').length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Confirmados</div>
          </div>
        </div>

        {siguiente && (
          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(26,26,46,0.25)' }}
            onClick={() => setConciertoSeleccionado(siguiente)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 42, fontWeight: 600, color: '#7F77DD', lineHeight: 1 }}>{diasRestantes}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{diasRestantes === 1 ? 'día' : 'días'}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 16, flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>PRÓXIMO CONCIERTO</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 2 }}>{siguiente.artista}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  {new Date(siguiente.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {siguiente.ciudad}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#69d08c' }}>{resumen.van}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Van</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#AFA9EC' }}>{resumen.entradas}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Entradas</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: resumen.pendientePago > 0 ? '#FAC775' : '#69d08c' }}>
                  {resumen.pendientePago > 0 ? resumen.pendientePago.toFixed(0) + '€' : '✓'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  {resumen.pendientePago > 0 ? 'Pdte. pago' : 'Pagado'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 10 }}>PRÓXIMOS CONCIERTOS</div>
        {proximos.length === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888', fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            Aún no hay conciertos.<br />
            <span style={{ color: '#7F77DD', cursor: 'pointer' }} onClick={() => setMostrarNuevo(true)}>Añade el primero</span>
          </div>
        )}
        {proximos.slice(0, 3).map(c => <TarjetaConcierto key={c.id} c={c} />)}
      </div>
    )
  }

  const PantallaConciertos = () => (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>CONCIERTOS</div>
        <button onClick={() => setMostrarNuevo(true)} style={{ background: '#7F77DD', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>+ Nuevo</button>
      </div>
      {proximos.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#7F77DD', fontWeight: 500, marginBottom: 8 }}>PRÓXIMOS</div>
          {proximos.map(c => <TarjetaConcierto key={c.id} c={c} />)}
        </>
      )}
      {pasados.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 8, marginTop: 8 }}>PASADOS</div>
          {pasados.map(c => <TarjetaConcierto key={c.id} c={c} opacidad={0.5} />)}
        </>
      )}
      {conciertos.length === 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888' }}>No hay conciertos todavía</div>
      )}
    </div>
  )

  if (conciertoEditando) return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <EditarConcierto
        concierto={conciertoEditando}
        amigos={amigos}
        onGuardado={() => { setConciertoEditando(null); setConciertoSeleccionado(null); cargarConciertos() }}
        onCancelar={() => setConciertoEditando(null)}
      />
    </div>
  )

  if (conciertoSeleccionado) return (
    <FichaConcierto
      concierto={conciertoSeleccionado}
      amigos={amigos}
      onVolver={() => setConciertoSeleccionado(null)}
      onEditar={() => setConciertoEditando(conciertoSeleccionado)}
    />
  )

  if (mostrarNuevo) return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <NuevoConcierto
        amigos={amigos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />
    </div>
  )

  const pantallas = {
    inicio: <PantallaInicio />,
    conciertos: <PantallaConciertos />,
    grupo: <Grupo amigos={amigos} onActualizado={() => supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))} />
  }

  // TABS CON ICONOS LUCIDE
  const tabs = [
    { id: 'inicio',     label: 'Inicio',     Icon: Home },
    { id: 'conciertos', label: 'Conciertos', Icon: Music2 },
    { id: 'grupo',      label: 'Grupo',      Icon: Users },
  ]

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: '#f0f0f5', minHeight: '100vh' }}>
      <Header amigos={amigos} />

      {/* NAVBAR CON ICONOS LUCIDE */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e5e5',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
      }}>
        {tabs.map(({ id, label, Icon }) => {
          const activo = pantalla === id
          return (
            <button key={id} onClick={() => setPantalla(id)} style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: 10,
              fontWeight: activo ? 600 : 400,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activo ? '2px solid #7F77DD' : '2px solid transparent',
              color: activo ? '#7F77DD' : '#aaa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'color 0.15s',
            }}>
              <Icon size={20} strokeWidth={activo ? 2.2 : 1.6} />
              {label}
            </button>
          )
        })}
      </div>

      {pantallas[pantalla]}

      {pantalla === 'conciertos' && (
        <button onClick={() => setMostrarNuevo(true)} style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 48, height: 48, borderRadius: '50%',
          background: '#7F77DD', color: 'white', border: 'none',
          fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(127,119,221,0.4)'
        }}>+</button>
      )}
    </div>
  )
}
