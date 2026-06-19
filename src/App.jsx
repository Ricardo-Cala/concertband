import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Home, Music2, Users } from 'lucide-react'
import Header from './components/Header'
import FichaConcierto from './components/FichaConcierto'
import EditarConcierto from './components/EditarConcierto'
import NuevoConcierto from './components/NuevoConcierto'
import Grupo from './components/Grupo'
import EstadisticasGrupo from './components/EstadisticasGrupo'

export default function App() {
  const [pantalla, setPantalla] = useState('inicio')
  const [amigos, setAmigos] = useState([])
  const [conciertos, setConciertos] = useState([])
  const [asistentes, setAsistentes] = useState([])
  const [gastos, setGastos] = useState([])
  const [conciertoSeleccionado, setConciertoSeleccionado] = useState(null)
  const [conciertoEditando, setConciertoEditando] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [verEstadisticas, setVerEstadisticas] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [pullDistance, setPullDistance] = useState(0)
  const [refrescando, setRefrescando] = useState(false)

  useEffect(() => {
    supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
    supabase.from('asistentes').select('*').then(({ data }) => data && setAsistentes(data))
    supabase.from('gastos').select('*').then(({ data }) => data && setGastos(data))
    cargarConciertos()
    const canal = supabase
      .channel('cambios-globales')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conciertos' }, () => cargarConciertos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transportes' }, () => cargarConciertos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hoteles' }, () => cargarConciertos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'amigos' }, () => {
        supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asistentes' }, () => {
        supabase.from('asistentes').select('*').then(({ data }) => data && setAsistentes(data))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, () => {
        supabase.from('gastos').select('*').then(({ data }) => data && setGastos(data))
      })
      .subscribe()
    return () => supabase.removeChannel(canal)
  }, [])

  useEffect(() => {
    let startY = 0
    let pulling = false
    let currentDistance = 0

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY
      pulling = window.scrollY === 0
    }

    const onTouchMove = (e) => {
      if (!pulling) return
      const diff = e.touches[0].clientY - startY
      if (diff > 0 && diff < 150) {
        currentDistance = diff
        setPullDistance(diff)
      }
    }

    const onTouchEnd = async (e) => {
      if (!pulling) return
      const diff = e.changedTouches[0].clientY - startY
      setPullDistance(0)
      if (diff > 80) {
        setRefrescando(true)
        await cargarConciertos()
        await supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
        await supabase.from('asistentes').select('*').then(({ data }) => data && setAsistentes(data))
        await supabase.from('gastos').select('*').then(({ data }) => data && setGastos(data))
        setRefrescando(false)
      }
      pulling = false
      currentDistance = 0
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const cargarConciertos = async () => {
    const { data } = await supabase.from('conciertos').select(`*, transportes(*), hoteles(*)`).order('fecha')
    if (data) setConciertos(data)
    setCargando(false)
  }

  const hoy = new Date(new Date().toDateString())
  const proximos = conciertos.filter(c => new Date(c.fecha) >= hoy)
  const pasados = conciertos.filter(c => new Date(c.fecha) < hoy).reverse()

  const tagEstado = (estado) => ({
    background: estado === 'confirmado'
      ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
      : 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
    color: estado === 'confirmado' ? 'var(--warm-grey)' : 'var(--text-secondary)',
    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
  })

  const tagInfo = {
    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
    letterSpacing: '0.05em',
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
  }

  const iconTransporte = (tipo) => {
    if (tipo === 'Avión') return '✈️'
    if (tipo === 'Coche') return '🚗'
    if (tipo === 'Autobús') return '🚌'
    if (tipo === 'AVE') return '🚄'
    return '🚆'
  }

  const SkeletonCard = () => (
    <div style={{
      background: 'var(--bg)', borderRadius: 20, padding: 18, marginBottom: 12,
      boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)'
    }}>
      <div className='skeleton' style={{ height: 14, width: '60%', marginBottom: 8 }} />
      <div className='skeleton' style={{ height: 11, width: '85%', marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <div className='skeleton' style={{ height: 18, width: 70, borderRadius: 20 }} />
        <div className='skeleton' style={{ height: 18, width: 50, borderRadius: 20 }} />
      </div>
    </div>
  )

  const SkeletonProximo = () => (
    <div style={{
      background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
      borderRadius: 20, padding: 18, marginBottom: 16,
      boxShadow: '0 6px 16px rgba(60,48,40,0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div className='skeleton' style={{ height: 50, width: 56, background: 'linear-gradient(90deg, #6E6357 0%, #7A6E62 50%, #6E6357 100%)', backgroundSize: '800px 100%' }} />
        <div style={{ flex: 1, borderLeft: '1px solid rgba(245,239,230,0.15)', paddingLeft: 16 }}>
          <div className='skeleton' style={{ height: 11, width: '50%', marginBottom: 6, background: 'linear-gradient(90deg, #6E6357 0%, #7A6E62 50%, #6E6357 100%)', backgroundSize: '800px 100%' }} />
          <div className='skeleton' style={{ height: 14, width: '70%', marginBottom: 4, background: 'linear-gradient(90deg, #6E6357 0%, #7A6E62 50%, #6E6357 100%)', backgroundSize: '800px 100%' }} />
          <div className='skeleton' style={{ height: 10, width: '55%', background: 'linear-gradient(90deg, #6E6357 0%, #7A6E62 50%, #6E6357 100%)', backgroundSize: '800px 100%' }} />
        </div>
      </div>
    </div>
  )

  const TarjetaConcierto = ({ c, opacidad = 1 }) => (
    <div className='fade-in-up card-tap' onClick={() => setConciertoSeleccionado(c)} style={{
      background: 'var(--bg)',
      borderRadius: 20,
      padding: 18,
      marginBottom: 14,
      cursor: 'pointer',
      opacity: opacidad,
      transition: 'opacity 0.15s',
      boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{c.artista}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.03em' }}>
            {new Date(c.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {c.recinto}, {c.ciudad}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={tagEstado(c.estado)}>{c.estado}</span>
            {c.hora_apertura && (
              <span style={tagInfo}>🕐 {c.hora_apertura.slice(0,5)}h</span>
            )}
            {c.transportes?.[0] && (
              <span style={tagInfo}>{iconTransporte(c.transportes[0].tipo)} {c.transportes[0].tipo}</span>
            )}
            {c.hoteles?.[0] && (
              <span style={tagInfo}> {c.hoteles[0].nombre}</span>
            )}
          </div>
        </div>
        <span style={{ color: 'var(--text-secondary)', fontSize: 20, marginLeft: 8 }}>›</span>
      </div>
    </div>
  )

  const PantallaInicio = () => {
    const siguiente = proximos[0]
    const diasRestantes = siguiente ? (() => {
      const fechaConcierto = new Date(siguiente.fecha)
      fechaConcierto.setHours(0, 0, 0, 0)
      const hoyNorm = new Date()
      hoyNorm.setHours(0, 0, 0, 0)
      return Math.round((fechaConcierto - hoyNorm) / (1000 * 60 * 60 * 24))
    })() : null
    const [resumen, setResumen] = useState({ van: 0, pendientePago: 0 })

    useEffect(() => {
      if (!siguiente) return
      Promise.all([
        supabase.from('asistentes').select('*').eq('concierto_id', siguiente.id).eq('confirmado', true),
        supabase.from('gastos').select('id').eq('concierto_id', siguiente.id),
      ]).then(async ([a, g]) => {
        let pendientePago = 0
        if (g.data && g.data.length > 0) {
          const gastoIds = g.data.map(x => x.id)
          const { data: p } = await supabase.from('pagos').select('cantidad').in('gasto_id', gastoIds).eq('pagado', false)
          pendientePago = p?.reduce((s, x) => s + Number(x.cantidad), 0) || 0
        }
        setResumen({
          van: a.data?.length || 0,
          pendientePago,
        })
      })
    }, [siguiente?.id])

    const statCard = {
      background: 'var(--bg)',
      borderRadius: 18,
      padding: 18,
      boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
    }

    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          <div style={statCard}>
            <div style={{ fontSize: 28, fontWeight: 300, color: 'var(--sage-dark)' }}>{conciertos.length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Conciertos totales</div>
          </div>
          <div style={statCard}>
            <div style={{ fontSize: 28, fontWeight: 300, color: 'var(--sage-dark)' }}>{conciertos.filter(c => c.estado === 'confirmado').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Confirmados</div>
          </div>
        </div>

        {cargando && <SkeletonProximo />}
        {!cargando && siguiente && (
          <div className='fade-in-up card-tap' style={{
            background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
            borderRadius: 20, padding: 20, marginBottom: 18, cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(60,48,40,0.25)'
          }} onClick={() => setConciertoSeleccionado(siguiente)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 44, fontWeight: 300, color: 'var(--sage-light)', lineHeight: 1, letterSpacing: '0.02em' }}>{diasRestantes}</div>
                <div style={{ fontSize: 10, color: 'rgba(245,239,230,0.5)', marginTop: 6, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>{diasRestantes === 0 ? '¡Hoy!' : diasRestantes === 1 ? 'día' : 'días'}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(245,239,230,0.15)', paddingLeft: 18, flex: 1 }}>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.45)', marginBottom: 6, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 600 }}>Próximo concierto</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--bg-light)', marginBottom: 4, letterSpacing: '0.04em' }}>{siguiente.artista}</div>
                <div style={{ fontSize: 11, color: 'rgba(245,239,230,0.55)', letterSpacing: '0.05em' }}>
                  {new Date(siguiente.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {siguiente.ciudad}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--sage-light)' }}>{resumen.van}</div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Van</div>
              </div>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: resumen.pendientePago > 0 ? '#FAC775' : 'var(--sage-light)' }}>
                  {resumen.pendientePago > 0 ? resumen.pendientePago.toFixed(0) + '€' : '✓'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {resumen.pendientePago > 0 ? 'Pdte. pago' : 'Pagado'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Próximos conciertos</div>
        {proximos.length === 0 && (
          <div style={{
            background: 'var(--bg)', borderRadius: 20, padding: 22, textAlign: 'center',
            color: 'var(--text-secondary)', fontSize: 13,
            boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)'
          }}>
            Aún no hay conciertos.<br />
            <span style={{ color: 'var(--sage-dark)', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.05em' }} onClick={() => setMostrarNuevo(true)}>Añade el primero</span>
          </div>
        )}
        {cargando
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : proximos.slice(0, 3).map(c => <TarjetaConcierto key={c.id} c={c} />)
        }
      </div>
    )
  }

  const PantallaConciertos = () => (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Conciertos</div>
        <button onClick={() => setMostrarNuevo(true)} className='btn-tap' style={{
          background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
          color: 'var(--warm-grey)', border: 'none', borderRadius: 20,
          padding: '7px 16px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
          fontFamily: 'inherit',
        }}>+ Nuevo</button>
      </div>
      {cargando && (
        <>
          <div style={{ fontSize: 10, color: 'var(--sage-dark)', fontWeight: 700, marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Próximos</div>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </>
      )}
      {!cargando && proximos.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: 'var(--sage-dark)', fontWeight: 700, marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Próximos</div>
          {proximos.map(c => <TarjetaConcierto key={c.id} c={c} />)}
        </>
      )}
      {pasados.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10, marginTop: 12, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Pasados</div>
          {pasados.map(c => <TarjetaConcierto key={c.id} c={c} opacidad={0.55} />)}
        </>
      )}
      {conciertos.length === 0 && (
        <div style={{
          background: 'var(--bg)', borderRadius: 20, padding: 22, textAlign: 'center',
          color: 'var(--text-secondary)',
          boxShadow: '8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)'
        }}>No hay conciertos todavía</div>
      )}
    </div>
  )

  if (verEstadisticas) return (
    <EstadisticasGrupo
      conciertos={conciertos}
      amigos={amigos}
      asistentes={asistentes}
      gastos={gastos}
      onBack={() => setVerEstadisticas(false)}
    />
  )

  if (conciertoEditando) return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>
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
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>
      <NuevoConcierto
        amigos={amigos}
        conciertos={conciertos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />
    </div>
  )

  const pantallas = {
    inicio: <PantallaInicio />,
    conciertos: <PantallaConciertos />,
    grupo: <Grupo
      amigos={amigos}
      onActualizado={() => supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))}
      onAbrirEstadisticas={() => setVerEstadisticas(true)}
    />
  }

  const tabs = [
    { id: 'inicio',     label: 'Inicio',     Icon: Home },
    { id: 'conciertos', label: 'Conciertos', Icon: Music2 },
    { id: 'grupo',      label: 'Grupo',      Icon: Users },
  ]

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, maxWidth: 390, width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: refrescando ? 50 : Math.min(pullDistance, 80),
        opacity: refrescando ? 1 : Math.min(pullDistance / 80, 1),
        background: 'rgba(235,221,208,0.95)',
        backdropFilter: 'blur(8px)',
        transition: refrescando ? 'height 0.2s' : 'none',
        pointerEvents: 'none',
        fontSize: 12, color: 'var(--sage-dark)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase'
      }}>
        {refrescando ? (
          <span><span className='spin' style={{ display: 'inline-block' }}>🔄</span> Actualizando...</span>
        ) : pullDistance > 80 ? (
          <span>↑ Suelta para refrescar</span>
        ) : pullDistance > 0 ? (
          <span style={{ display: 'inline-block', transform: `rotate(${Math.min(pullDistance * 2, 180)}deg)` }}>↓</span>
        ) : null}
      </div>
      <Header amigos={amigos} />

      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(94,82,70,0.08)',
        padding: '6px 12px',
        gap: 6,
      }}>
        {tabs.map(({ id, label, Icon }) => {
          const activo = pantalla === id
          return (
            <button key={id} onClick={() => setPantalla(id)} className='btn-tap' style={{
              flex: 1,
              padding: '10px 4px',
              fontSize: 9,
              fontWeight: 700,
              background: activo ? 'linear-gradient(145deg, var(--sage-light), var(--sage))' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: 12,
              color: activo ? 'var(--warm-grey)' : 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
              boxShadow: activo ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)' : 'none',
              fontFamily: 'inherit',
            }}>
              <Icon size={18} strokeWidth={activo ? 2.2 : 1.6} />
              {label}
            </button>
          )
        })}
      </div>

      {pantallas[pantalla]}

      {pantalla === 'conciertos' && (
        <button onClick={() => setMostrarNuevo(true)} className='btn-tap' style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
          color: 'var(--warm-grey)', border: 'none',
          fontSize: 26, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '5px 5px 12px var(--shadow-dark), -5px -5px 12px var(--shadow-light)',
          fontFamily: 'inherit',
        }}>+</button>
      )}
    </div>
  )
}
