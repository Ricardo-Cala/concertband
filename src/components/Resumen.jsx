import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Resumen({ conciertos, amigos }) {
  const [concierto, setConcierto] = useState('')
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    if (concierto) cargarDatos()
  }, [concierto])

  const cargarDatos = async () => {
    const [asistentes, entradas, transporte, hotel] = await Promise.all([
      supabase.from('asistentes').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto),
      supabase.from('entradas').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto),
      supabase.from('transportes').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto).single(),
      supabase.from('hoteles').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto).single(),
    ])
    setDatos({
      asistentes: asistentes.data || [],
      entradas: entradas.data || [],
      transporte: transporte.data || null,
      hotel: hotel.data || null,
    })
  }

  const conciertoSeleccionado = conciertos.find(c => c.id === concierto)

  const van = datos?.asistentes.filter(a => a.confirmado === true) || []
  const novan = datos?.asistentes.filter(a => a.confirmado === false) || []
  const pendientes = amigos.filter(a =>
    !datos?.asistentes.find(as => as.amigo_id === a.id)
  ) || []

  const totalEntradas = datos?.entradas.reduce((s, e) => s + e.cantidad, 0) || 0
  const entradasPagadas = datos?.entradas.filter(e => e.pagada).reduce((s, e) => s + e.cantidad, 0) || 0

  const Seccion = ({ titulo, color }) => (
    <div style={{ fontSize: 11, fontWeight: 500, color, marginBottom: 8, marginTop: 16, letterSpacing: 0.5 }}>
      {titulo}
    </div>
  )

  const Avatar = ({ amigo, extra }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: amigo.color || amigo.amigos?.color,
        color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0
      }}>
        {amigo.iniciales || amigo.amigos?.iniciales}
      </div>
      <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
        {amigo.nombre || amigo.amigos?.nombre}
      </span>
      {extra && <span style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>{extra}</span>}
    </div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>RESUMEN</div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Selecciona el concierto</label>
        <select value={concierto} onChange={e => setConcierto(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
          <option value=''>— Elige un concierto —</option>
          {conciertos.map(c => (
            <option key={c.id} value={c.id}>
              {c.artista} · {new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {concierto && conciertoSeleccionado && datos && (
        <>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 16, color: 'white' }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{conciertoSeleccionado.artista}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
              {new Date(conciertoSeleccionado.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              📍 {conciertoSeleccionado.recinto}, {conciertoSeleccionado.ciudad}
            </div>
            {conciertoSeleccionado.hora_apertura && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                Apertura puertas: {conciertoSeleccionado.hora_apertura}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#27500A' }}>{van.length}</div>
              <div style={{ fontSize: 10, color: '#3B6D11' }}>Van</div>
            </div>
            <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#3C3489' }}>{totalEntradas}</div>
              <div style={{ fontSize: 10, color: '#534AB7' }}>Entradas</div>
            </div>
            <div style={{ background: entradasPagadas === totalEntradas && totalEntradas > 0 ? '#EAF3DE' : '#FAEEDA', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: entradasPagadas === totalEntradas && totalEntradas > 0 ? '#27500A' : '#633806' }}>{entradasPagadas}/{totalEntradas}</div>
              <div style={{ fontSize: 10, color: entradasPagadas === totalEntradas && totalEntradas > 0 ? '#3B6D11' : '#854F0B' }}>Pagadas</div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
            <Seccion titulo='ASISTENCIA' color='#3B6D11' />
            {van.length > 0 && van.map(a => <Avatar key={a.id} amigo={a.amigos} />)}

            {novan.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: '#A32D2D', marginTop: 10, marginBottom: 6 }}>NO VAN</div>
                {novan.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, opacity: 0.45 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: a.amigos?.color, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 500
                    }}>{a.amigos?.iniciales}</div>
                    <span style={{ fontSize: 13, textDecoration: 'line-through', color: '#888' }}>{a.amigos?.nombre}</span>
                  </div>
                ))}
              </>
            )}

            {pendientes.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: '#854F0B', marginTop: 10, marginBottom: 6 }}>PENDIENTES</div>
                {pendientes.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, opacity: 0.5 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: a.color, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 500
                    }}>{a.iniciales}</div>
                    <span style={{ fontSize: 13, color: '#888' }}>{a.nombre}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
            <Seccion titulo='ENTRADAS' color='#534AB7' />
            {datos.entradas.length === 0 && <div style={{ fontSize: 13, color: '#ccc' }}>Sin entradas registradas</div>}
            {datos.entradas.map(e => (
              <Avatar key={e.id} amigo={e.amigos} extra={`${e.cantidad} entrada${e.cantidad > 1 ? 's' : ''} · ${e.pagada ? '✓ pagada' : '· pendiente'}`} />
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
            <Seccion titulo='TRANSPORTE' color='#185FA5' />
            {!datos.transporte && <div style={{ fontSize: 13, color: '#ccc' }}>Sin transporte definido</div>}
            {datos.transporte && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>🚆 {datos.transporte.tipo}</span>
                {datos.transporte.amigos && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: datos.transporte.amigos.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500 }}>
                      {datos.transporte.amigos.iniciales}
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>{datos.transporte.amigos.nombre} gestiona</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
            <Seccion titulo='HOTEL' color='#0F6E56' />
            {!datos.hotel && <div style={{ fontSize: 13, color: '#ccc' }}>Sin hotel definido</div>}
            {datos.hotel && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>🏨 {datos.hotel.nombre || 'Por confirmar'}</span>
                {datos.hotel.amigos && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: datos.hotel.amigos.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500 }}>
                      {datos.hotel.amigos.iniciales}
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>{datos.hotel.amigos.nombre} reserva</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}