import { writeFileSync } from 'fs'

const code = `import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function FichaConcierto({ concierto, amigos, onVolver, onEditar }) {
  const [subtab, setSubtab] = useState('asistencia')
  const [asistentes, setAsistentes] = useState([])
  const [entradas, setEntradas] = useState([])
  const [gastos, setGastos] = useState([])
  const [pagos, setPagos] = useState([])
  const [transporte, setTransporte] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
  const [formGasto, setFormGasto] = useState({ comprador_id: '', precio_entrada: '', receptores: [] })
  const [mostrarFormEntrada, setMostrarFormEntrada] = useState(false)
  const [formEntrada, setFormEntrada] = useState({ amigo_id: '', cantidad: 1 })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const [a, e, g, t, h] = await Promise.all([
      supabase.from('asistentes').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('entradas').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('gastos').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('transportes').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id).single(),
      supabase.from('hoteles').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id).single(),
    ])
    setAsistentes(a.data || [])
    setEntradas(e.data || [])
    setGastos(g.data || [])
    setTransporte(t.data || null)
    setHotel(h.data || null)
    if (g.data && g.data.length > 0) {
      const { data: p } = await supabase.from('pagos').select('*, amigos(nombre, iniciales, color, foto_url)').in('gasto_id', g.data.map(x => x.id))
      setPagos(p || [])
    } else {
      setPagos([])
    }
  }

  const setEstadoAsistencia = async (amigoId, estado) => {
    const existente = asistentes.find(a => a.amigo_id === amigoId)
    if (estado === 'pendiente') {
      if (existente) await supabase.from('asistentes').delete().eq('id', existente.id)
    } else if (existente) {
      await supabase.from('asistentes').update({ confirmado: estado === 'va' }).eq('id', existente.id)
    } else {
      await supabase.from('asistentes').insert([{ concierto_id: concierto.id, amigo_id: amigoId, confirmado: estado === 'va' }])
    }
    cargarDatos()
  }

  const getEstado = (amigoId) => {
    const a = asistentes.find(a => a.amigo_id === amigoId)
    if (!a) return 'pendiente'
    return a.confirmado ? 'va' : 'nova'
  }

  const toggleReceptor = (amigoId) => {
    setFormGasto(f => ({
      ...f,
      receptores: f.receptores.includes(amigoId)
        ? f.receptores.filter(id => id !== amigoId)
        : [...f.receptores, amigoId]
    }))
  }

  const guardarGasto = async () => {
    if (!formGasto.comprador_id || !formGasto.precio_entrada) { alert('Rellena comprador y precio'); return }
    if (formGasto.receptores.length === 0) { alert('Selecciona al menos un amigo que recibió entrada'); return }
    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto.id,
      comprador_id: formGasto.comprador_id,
      precio_entrada: parseFloat(formGasto.precio_entrada),
      cantidad: formGasto.receptores.length,
    }]).select().single()
    if (gasto) {
      await supabase.from('pagos').insert(formGasto.receptores.map(amigoId => ({
        gasto_id: gasto.id,
        pagador_id: amigoId,
        cantidad: parseFloat(formGasto.precio_entrada),
        pagado: false,
      })))
    }
    setMostrarFormGasto(false)
    setFormGasto({ comprador_id: '', precio_entrada: '', receptores: [] })
    cargarDatos()
  }

  const guardarEntrada = async () => {
    if (!formEntrada.amigo_id) { alert('Selecciona un amigo'); return }
    await supabase.from('entradas').insert([{
      concierto_id: concierto.id,
      amigo_id: formEntrada.amigo_id,
      cantidad: parseInt(formEntrada.cantidad),
      pagada: false
    }])
    setMostrarFormEntrada(false)
    setFormEntrada({ amigo_id: '', cantidad: 1 })
    cargarDatos()
  }

  const cambiarCantidad = async (e, cantidad) => {
    if (cantidad < 1) return
    await supabase.from('entradas').update({ cantidad }).eq('id', e.id)
    cargarDatos()
  }

  const eliminarEntrada = async (id) => {
    await supabase.from('entradas').delete().eq('id', id)
    cargarDatos()
  }

  const togglePago = async (p) => {
    await supabase.from('pagos').update({ pagado: !p.pagado }).eq('id', p.id)
    cargarDatos()
  }

  const borrarGasto = async (id) => {
    await supabase.from('gastos').delete().eq('id', id)
    cargarDatos()
  }

  const iconTransporte = (tipo) => {
    if (tipo === 'Avión') return '✈️'
    if (tipo === 'Coche') return '🚗'
    if (tipo === 'Autobús') return '🚌'
    if (tipo === 'AVE') return '🚄'
    return '🚆'
  }

  const amigosConEntrada = entradas.map(e => e.amigo_id)
  const amigosDisponibles = amigos.filter(a => !amigosConEntrada.includes(a.id))
  const totalEntradas = entradas.reduce((s, e) => s + e.cantidad, 0)
  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + p.cantidad, 0)
  const totalCobrado = pagos.filter(p => p.pagado).reduce((s, p) => s + p.cantidad, 0)
  const van = amigos.filter(a => getEstado(a.id) === 'va')
  const novan = amigos.filter(a => getEstado(a.id) === 'nova')
  const pendientes = amigos.filter(a => getEstado(a.id) === 'pendiente')

  const amigosParaSeleccionar = amigos.filter(a => a.id !== formGasto.comprador_id)

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'white', minHeight: '100vh' }}>
      <div style={{ background: '#1a1a2e', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button onClick={onVolver} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', padding: 0 }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: 'white' }}>{concierto.artista}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {new Date(concierto.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {concierto.recinto}, {concierto.ciudad}
            </div>
          </div>
          <button onClick={onEditar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>✏️ Editar</button>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: concierto.estado === 'confirmado' ? '#EAF3DE' : '#FAEEDA', color: concierto.estado === 'confirmado' ? '#27500A' : '#633806' }}>{concierto.estado}</span>
          {transporte && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489' }}>{iconTransporte(transporte.tipo)} {transporte.tipo}</span>}
          {hotel && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#E1F5EE', color: '#085041' }}>🏨 {hotel.nombre || 'Hotel'}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '0.5px solid #eee', background: 'white' }}>
        {['asistencia', 'entradas'].map(t => (
          <button key={t} onClick={() => setSubtab(t)} style={{
            flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: subtab === t ? '2px solid #7F77DD' : '2px solid transparent',
            color: subtab === t ? '#7F77DD' : '#888',
          }}>
            {t === 'asistencia' ? '👋 Asistencia' : '🎟 Entradas y pagos'}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {subtab === 'asistencia' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#27500A' }}>{van.length}</div>
                <div style={{ fontSize: 10, color: '#3B6D11' }}>Van</div>
              </div>
              <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#791F1F' }}>{novan.length}</div>
                <div style={{ fontSize: 10, color: '#A32D2D' }}>No van</div>
              </div>
              <div style={{ background: '#FAEEDA', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#633806' }}>{pendientes.length}</div>
                <div style={{ fontSize: 10, color: '#854F0B' }}>Pendientes</div>
              </div>
            </div>
            {amigos.map(a => (
              <div key={a.id} style={{
                background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: '1px solid #eee',
                borderLeft: \`3px solid \${getEstado(a.id) === 'va' ? '#639922' : getEstado(a.id) === 'nova' ? '#E24B4A' : '#FAC775'}\`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar amigo={a} size={34} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{a.nombre}</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['va', 'nova', 'pendiente'].map((estado, i) => (
                      <button key={estado} onClick={() => setEstadoAsistencia(a.id, estado)} style={{
                        padding: '4px 8px', borderRadius: 20, border: 'none', fontSize: 10, fontWeight: 500, cursor: 'pointer',
                        background: ['#EAF3DE', '#FCEBEB', '#FAEEDA'][i],
                        color: ['#27500A', '#791F1F', '#633806'][i],
                        opacity: getEstado(a.id) === estado ? 1 : 0.3,
                      }}>{['✓', '✕', '?'][i]}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {subtab === 'entradas' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#3C3489' }}>{totalEntradas}</div>
                <div style={{ fontSize: 10, color: '#534AB7' }}>Entradas</div>
              </div>
              <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#791F1F' }}>{totalPendiente.toFixed(0)}€</div>
                <div style={{ fontSize: 10, color: '#A32D2D' }}>Pendiente</div>
              </div>
              <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#27500A' }}>{totalCobrado.toFixed(0)}€</div>
                <div style={{ fontSize: 10, color: '#3B6D11' }}>Cobrado</div>
              </div>
            </div>

            {gastos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 8 }}>QUIÉN COMPRÓ</div>
                {gastos.map(g => {
                  const pagosGasto = pagos.filter(p => p.gasto_id === g.id)
                  const pendientesG = pagosGasto.filter(p => !p.pagado)
                  const cobradosG = pagosGasto.filter(p => p.pagado)
                  return (
                    <div key={g.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: pendientesG.length + cobradosG.length > 0 ? 10 : 0 }}>
                        <Avatar amigo={g.amigos} size={34} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{g.amigos?.nombre} compró</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{g.cantidad} entrada{g.cantidad > 1 ? 's' : ''} · {g.precio_entrada}€ c/u · <span style={{ fontWeight: 500, color: '#534AB7' }}>{(g.precio_entrada * g.cantidad).toFixed(0)}€ total</span></div>
                        </div>
                        <button onClick={() => borrarGasto(g.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#ccc' }}>🗑️</button>
                      </div>
                      {pendientesG.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: '#A32D2D', marginBottom: 6, fontWeight: 500 }}>DEBEN PAGAR A {g.amigos?.nombre.toUpperCase()}</div>
                          {pendientesG.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <Avatar amigo={p.amigos} size={26} />
                              <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                              <span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{p.cantidad}€</span>
                              <button onClick={() => togglePago(p)} style={{ padding: '3px 10px', borderRadius: 20, border: 'none', background: '#FCEBEB', color: '#791F1F', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>· Pendiente</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {cobradosG.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, color: '#3B6D11', marginBottom: 6, fontWeight: 500 }}>YA PAGARON</div>
                          {cobradosG.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: 0.6 }}>
                              <Avatar amigo={p.amigos} size={26} />
                              <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                              <span style={{ fontSize: 12, color: '#3B6D11', fontWeight: 500 }}>{p.cantidad}€</span>
                              <button onClick={() => togglePago(p)} style={{ padding: '3px 10px', borderRadius: 20, border: 'none', background: '#EAF3DE', color: '#27500A', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>✓ Pagado</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 8 }}>ENTRADAS POR PERSONA</div>
            {entradas.map(e => (
              <div key={e.id} style={{ background: 'white', borderRadius: 12, padding: '10px 14px', marginBottom: 8, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar amigo={e.amigos} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{e.amigos?.nombre}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <button onClick={() => cambiarCantidad(e, e.cantidad - 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
                      <span style={{ fontSize: 13 }}>{e.cantidad}</span>
                      <button onClick={() => cambiarCantidad(e, e.cantidad + 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                      <span style={{ fontSize: 11, color: '#888' }}>entrada{e.cantidad > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <button onClick={() => eliminarEntrada(e.id)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#ccc', cursor: 'pointer' }}>quitar</button>
                </div>
              </div>
            ))}

            {!mostrarFormEntrada && amigosDisponibles.length > 0 && (
              <div style={{ marginTop: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Añadir persona con entrada:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {amigosDisponibles.map(a => (
                    <button key={a.id} onClick={() => { setFormEntrada(f => ({ ...f, amigo_id: a.id })); setMostrarFormEntrada(true) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 20, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>
                      <Avatar amigo={a} size={20} />
                      {a.nombre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mostrarFormEntrada && (
              <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, border: '1px solid #7F77DD' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 10 }}>AÑADIR ENTRADA</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Cantidad</label>
                  <input type='number' value={formEntrada.cantidad} min='1' onChange={e => setFormEntrada(f => ({ ...f, cantidad: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setMostrarFormEntrada(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13 }}>Cancelar</button>
                  <button onClick={guardarEntrada} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500 }}>Guardar</button>
                </div>
              </div>
            )}

            {!mostrarFormGasto && (
              <button onClick={() => setMostrarFormGasto(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'white', color: '#7F77DD', border: '1px solid #7F77DD', fontSize: 14, fontWeight: 500, marginTop: 8 }}>
                + Registrar quién compró las entradas
              </button>
            )}

            {mostrarFormGasto && (
              <div style={{ background: 'white', borderRadius: 12, padding: 16, marginTop: 8, border: '1px solid #7F77DD' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>¿QUIÉN COMPRÓ LAS ENTRADAS?</div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Comprador</label>
                  <select value={formGasto.comprador_id} onChange={e => setFormGasto(f => ({ ...f, comprador_id: e.target.value, receptores: [] }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
                    <option value=''>— Selecciona —</option>
                    {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Precio por entrada (€)</label>
                  <input type='number' value={formGasto.precio_entrada} onChange={e => setFormGasto(f => ({ ...f, precio_entrada: e.target.value }))}
                    placeholder='Ej: 37.40' style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                </div>

                {formGasto.comprador_id && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>¿A quién le dio las entradas? <span style={{ color: '#7F77DD' }}>({formGasto.receptores.length} seleccionados)</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {amigosParaSeleccionar.map(a => {
                        const seleccionado = formGasto.receptores.includes(a.id)
                        return (
                          <div key={a.id} onClick={() => toggleReceptor(a.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                            background: seleccionado ? '#EEEDFE' : '#f8f8f8',
                            border: seleccionado ? '1px solid #AFA9EC' : '1px solid #eee',
                          }}>
                            <Avatar amigo={a} size={28} />
                            <span style={{ fontSize: 13, flex: 1, fontWeight: seleccionado ? 500 : 400, color: seleccionado ? '#3C3489' : 'var(--color-text-primary)' }}>{a.nombre}</span>
                            <span style={{ fontSize: 16, color: seleccionado ? '#7F77DD' : '#ddd' }}>{seleccionado ? '✓' : '○'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setMostrarFormGasto(false); setFormGasto({ comprador_id: '', precio_entrada: '', receptores: [] }) }}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13 }}>Cancelar</button>
                  <button onClick={guardarGasto}
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500 }}>Guardar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}`

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('FichaConcierto.jsx actualizado')