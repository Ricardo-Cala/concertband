import Asistencia from './components/Asistencia'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Header from './components/Header'
import NavBar from './components/NavBar'
import NuevoConcierto from './components/NuevoConcierto'
import Entradas from './components/Entradas'

export default function App() {
  const [pantalla, setPantalla] = useState('inicio')
  const [amigos, setAmigos] = useState([])
  const [conciertos, setConciertos] = useState([])
  const [mostrarNuevo, setMostrarNuevo] = useState(false)

  useEffect(() => {
    supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
    cargarConciertos()
  }, [])

  const cargarConciertos = async () => {
    const { data } = await supabase.from('conciertos').select(`
      *, transportes(*), hoteles(*)
    `).order('fecha')
    if (data) setConciertos(data)
  }

  const tagEstado = (estado) => ({
    background: estado === 'confirmado' ? '#EAF3DE' : '#FAEEDA',
    color: estado === 'confirmado' ? '#27500A' : '#633806',
    padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500
  })

  const PantallaInicio = () => (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'white', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 500 }}>{conciertos.length}</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Conciertos totales</div>
        </div>
        <div style={{ background: 'white', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 500 }}>
            {conciertos.filter(c => c.estado === 'confirmado').length}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Confirmados</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 10 }}>PRÓXIMOS CONCIERTOS</div>
      {conciertos.length === 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888', fontSize: 14 }}>
          Aún no hay conciertos.<br />
          <span style={{ color: '#7F77DD', cursor: 'pointer' }} onClick={() => setMostrarNuevo(true)}>
            Añade el primero
          </span>
        </div>
      )}
      {conciertos.slice(0, 3).map(c => (
        <div key={c.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, borderLeft: '3px solid #7F77DD' }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{c.artista}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            {new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })} · {c.recinto}, {c.ciudad}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={tagEstado(c.estado)}>{c.estado}</span>
            {c.transportes?.[0] && <span style={{ background: '#EEEDFE', color: '#3C3489', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{c.transportes[0].tipo}</span>}
            {c.hoteles?.[0] && <span style={{ background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>{c.hoteles[0].nombre}</span>}
          </div>
        </div>
      ))}
    </div>
  )

  const PantallaConciertos = () => (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>TODOS LOS CONCIERTOS</div>
        <button onClick={() => setMostrarNuevo(true)} style={{ background: '#7F77DD', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500 }}>+ Nuevo</button>
      </div>
      {conciertos.length === 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888' }}>
          No hay conciertos todavía
        </div>
      )}
      {conciertos.map(c => (
        <div key={c.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{c.artista}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            {new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>📍 {c.recinto}, {c.ciudad}</div>
          {c.hora_apertura && <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Apertura: {c.hora_apertura}</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={tagEstado(c.estado)}>{c.estado}</span>
            {c.transportes?.[0] && <span style={{ background: '#EEEDFE', color: '#3C3489', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>🚆 {c.transportes[0].tipo}</span>}
            {c.hoteles?.[0] && <span style={{ background: '#E1F5EE', color: '#085041', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>🏨 {c.hoteles[0].nombre}</span>}
          </div>
        </div>
      ))}
    </div>
  )

  const PantallaGrupo = () => (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>MIEMBROS · {amigos.length}</div>
      {amigos.map(a => (
        <div key={a.id} style={{ background: 'white', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{a.iniciales}</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{a.nombre}</div>
        </div>
      ))}
    </div>
  )

  const PantallaCalendario = () => {
    const meses = {}
    conciertos.forEach(c => {
      const d = new Date(c.fecha)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!meses[key]) meses[key] = { label: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), eventos: [] }
      meses[key].eventos.push(c)
    })
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>CALENDARIO</div>
        {Object.keys(meses).length === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888' }}>
            No hay eventos en el calendario
          </div>
        )}
        {Object.values(meses).map((mes, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8, textTransform: 'capitalize' }}>{mes.label}</div>
            {mes.eventos.map(c => (
              <div key={c.id} style={{ background: 'white', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ background: '#EEEDFE', borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 40 }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: '#3C3489' }}>{new Date(c.fecha).getDate()}</div>
                  <div style={{ fontSize: 10, color: '#534AB7' }}>{new Date(c.fecha).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{c.artista}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{c.recinto}, {c.ciudad}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (mostrarNuevo) return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <NuevoConcierto
        amigos={amigos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />
    </div>
  )

 const pantallas = { inicio: <PantallaInicio />, conciertos: <PantallaConciertos />, entradas: <Entradas conciertos={conciertos} amigos={amigos} />, asistencia: <Asistencia conciertos={conciertos} amigos={amigos} />, calendario: <PantallaCalendario />, grupo: <PantallaGrupo /> }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <Header amigos={amigos} />
      <NavBar pantalla={pantalla} setPantalla={setPantalla} />
      {pantallas[pantalla]}
      <button onClick={() => setMostrarNuevo(true)} style={{
        position: 'fixed', bottom: 24, right: 24,
        width: 48, height: 48, borderRadius: '50%',
        background: '#7F77DD', color: 'white', border: 'none',
        fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>+</button>
    </div>
  )
}