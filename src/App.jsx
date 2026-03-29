import { useState, useEffect } from 'react'
import { supabase } from './supabase'
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
  const pasados = conciertos.filter(c => new Date(c.fecha) < hoy)

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

  const TarjetaConcierto = ({ c, opacidad = 1 }) => (
    <div onClick={() => { setConciertoSeleccionado(c) }} style={{
      background: 'white', borderRadius: 12, padding: 14, marginBottom: 10,
      borderLeft: '3px solid #7F77DD', cursor: 'pointer', opacity: opacidad,
      transition: 'opacity 0.15s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{c.artista}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            {new Date(c.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {c.recinto}, {c.ciudad}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={tagEstado(c.estado)}>{c.estado}</span>
            {c.transportes?.[0] && <span style={{ background: '#EEEDFE', color: '#3C3489', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{iconTransporte(c.transportes[0].tipo)} {c.transportes[0].tipo}</span>}
            {c.hoteles?.[0] && <span style={{ background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>🏨 {c.hoteles[0].nombre}</span>}
          </div>
        </div>
        <span style={{ color: '#7F77DD', fontSize: 20, marginLeft: 8 }}>›</span>
      </div>
    </div>
  )

  const PantallaInicio = () => {
    const siguiente = proximos[0]
    const diasRestantes = siguiente ? Math.ceil((new Date(siguiente.fecha) - hoy) / (1000 * 60 * 60 * 24)) : null
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'white', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{conciertos.length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Conciertos totales</div>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{conciertos.filter(c => c.estado === 'confirmado').length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Confirmados</div>
          </div>
        </div>

        {siguiente && (
          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            onClick={() => setConciertoSeleccionado(siguiente)}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 42, fontWeight: 500, color: '#7F77DD', lineHeight: 1 }}>{diasRestantes}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{diasRestantes === 1 ? 'día' : 'días'}</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 16, flex: 1 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>PRÓXIMO CONCIERTO</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 2 }}>{siguiente.artista}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {new Date(siguiente.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {siguiente.ciudad}
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 10 }}>PRÓXIMOS CONCIERTOS</div>
        {proximos.length === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888', fontSize: 14 }}>
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

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: '★' },
    { id: 'conciertos', label: 'Conciertos', icon: '♪' },
    { id: 'grupo', label: 'Grupo', icon: '👥' },
  ]

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: '#f5f5f7', minHeight: '100vh' }}>
      <Header amigos={amigos} />
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', background: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setPantalla(t.id)} style={{
            flex: 1, padding: '10px 4px', fontSize: 11, background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: pantalla === t.id ? '2px solid #7F77DD' : '2px solid transparent',
            color: pantalla === t.id ? '#7F77DD' : '#888',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
          }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {pantallas[pantalla]}
      {pantalla === 'conciertos' && (
        <button onClick={() => setMostrarNuevo(true)} style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 48, height: 48, borderRadius: '50%',
          background: '#7F77DD', color: 'white', border: 'none',
          fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>+</button>
      )}
    </div>
  )
}