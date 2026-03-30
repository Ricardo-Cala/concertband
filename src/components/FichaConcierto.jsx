import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'
import Toast from './Toast'

export default function FichaConcierto({ concierto, amigos, onVolver, onEditar }) {
  const [subtab, setSubtab] = useState('asistencia')
  const [asistentes, setAsistentes] = useState([])
  const [gastos, setGastos] = useState([])
  const [pagos, setPagos] = useState([])
  const [transporte, setTransporte] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
  const [formGasto, setFormGasto] = useState({ comprador_id: '', precio_entrada: '', receptores: [] })
  const [toast, setToast] = useState(null)
  const mostrarToast = (mensaje, tipo = 'ok') => setToast({ mensaje, tipo })

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const [a, g, t, h] = await Promise.all([
      supabase.from('asistentes').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('gastos').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('transportes').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id).single(),
      supabase.from('hoteles').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id).single(),
    ])
    setAsistentes(a.data || [])
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
    mostrarToast(estado === 'va' ? '¡Va al concierto!' : estado === 'nova' ? 'No va' : 'Pendiente de confirmar')
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
    const totalPersonas = formGasto.receptores.length + 1
    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto.id,
      comprador_id: formGasto.comprador_id,
      precio_entrada: parseFloat(formGasto.precio_entrada),
      cantidad: totalPersonas,
    }]).select().single()
    if (gasto) {
      const todosReceptores = [
        { amigoId: formGasto.comprador_id, pagado: true },
        ...formGasto.receptores.map(amigoId => ({ amigoId, pagado: false }))
      ]
      await supabase.from('pagos').insert(todosReceptores.map(r => ({
        gasto_id: gasto.id,
        pagador_id: r.amigoId,
        cantidad: parseFloat(formGasto.precio_entrada),
        pagado: r.pagado,
      })))
    }
    setMostrarFormGasto(false)
    setFormGasto({ comprador_id: '', precio_entrada: '', receptores: [] })
    cargarDatos()
    mostrarToast('Comprador registrado')
  }

  const togglePago = async (p) => {
    await supabase.from('pagos').update({ pagado: !p.pagado }).eq('id', p.id)
    cargarDatos()
    mostrarToast(p.pagado ? 'Marcado como pendiente' : 'Pago confirmado')
  }

  const borrarGasto = async (id) => {
    await supabase.from('gastos').delete().eq('id', id)
    cargarDatos()
    mostrarToast('Comprador eliminado')
  }

  const iconTransporte = (tipo) => {
    if (tipo === 'Avión') return '✈️'
    if (tipo === 'Coche') return '🚗'
    if (tipo === 'Autobús') return '🚌'
    if (tipo === 'AVE') return '🚄'
    return '🚆'
  }

  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + Number(p.cantidad), 0)
  const totalCobrado = pagos.filter(p => p.pagado && p.pagador_id !== gastos.find(g => g.id === p.gasto_id)?.comprador_id).reduce((s, p) => s + Number(p.cantidad), 0)
  const totalGastado = gastos.reduce((s, g) => s + g.precio_entrada * g.cantidad, 0)
  const van = amigos.filter(a => getEstado(a.id) === 'va')
  const novan = amigos.filter(a => getEstado(a.id) === 'nova')
  const pendientes = amigos.filter(a => getEstado(a.id) === 'pendiente')
  const amigosParaSeleccionar = amigos

  const resumenPorAmigo = amigos.map(amigo => {
    const deudas = pagos.filter(p => p.pagador_id === amigo.id && !p.pagado)
    const pagados = pagos.filter(p => p.pagador_id === amigo.id && p.pagado && p.pagador_id !== gastos.find(g => g.id === p.gasto_id)?.comprador_id)
    const totalDebe = deudas.reduce((s, p) => s + Number(p.cantidad), 0)
    const detalleDeudas = deudas.map(p => {
      const gasto = gastos.find(g => g.id === p.gasto_id)
      const comprador = amigos.find(a => a.id === gasto?.comprador_id)
      return { comprador, cantidad: Number(p.cantidad) }
    })
    return { amigo, totalDebe, detalleDeudas, pagados }
  }).filter(r => r.totalDebe > 0 || r.pagados.length > 0)

  const Av = ({ a, size = 34 }) => <Avatar amigo={a} size={size} />

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
                borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: '1px solid #eee',
                background: getEstado(a.id) === 'va' ? '#EAF3DE' : getEstado(a.id) === 'nova' ? '#FCEBEB' : 'white',
                borderLeft: `3px solid ${getEstado(a.id) === 'va' ? '#639922' : getEstado(a.id) === 'nova' ? '#E24B4A' : '#FAC775'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Av a={a} />
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
                <div style={{ fontSize: 20, fontWeight: 500, color: '#3C3489' }}>{totalGastado.toFixed(2)}€</div>
                <div style={{ fontSize: 10, color: '#534AB7' }}>Total</div>
              </div>
              <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#791F1F' }}>{totalPendiente.toFixed(2)}€</div>
                <div style={{ fontSize: 10, color: '#A32D2D' }}>Pendiente</div>
              </div>
              <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#27500A' }}>{totalCobrado.toFixed(2)}€</div>
                <div style={{ fontSize: 10, color: '#3B6D11' }}>Cobrado</div>
              </div>
            </div>

            {gastos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 8 }}>QUIÉN COMPRÓ</div>
                {gastos.map(g => {
                  const pagosGasto = pagos.filter(p => p.gasto_id === g.id)
                  const pendientesG = pagosGasto.filter(p => !p.pagado)
                  const cobradosG = pagosGasto.filter(p => p.pagado && p.pagador_id !== g.comprador_id)
                  return (
                    <div key={g.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: pendientesG.length + cobradosG.length > 0 ? 10 : 0 }}>
                        <Av a={g.amigos} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{g.amigos?.nombre} compró</div>
                          <div style={{ fontSize: 12, color: '#888' }}>{g.cantidad} entrada{g.cantidad > 1 ? 's' : ''} · {Number(g.precio_entrada).toFixed(2)}€ c/u · <span style={{ fontWeight: 500, color: '#534AB7' }}>{(g.precio_entrada * g.cantidad).toFixed(2)}€ total</span></div>
                        </div>
                        <button onClick={() => borrarGasto(g.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#ccc' }}>🗑️</button>
                      </div>
                      {pendientesG.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 10, color: '#A32D2D', marginBottom: 6, fontWeight: 500 }}>DEBEN PAGAR A {g.amigos?.nombre.toUpperCase()}</div>
                          {pendientesG.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <Av a={p.amigos} size={26} />
                              <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                              <span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{Number(p.cantidad).toFixed(2)}€</span>
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
                              <Av a={p.amigos} size={26} />
                              <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                              <span style={{ fontSize: 12, color: '#3B6D11', fontWeight: 500 }}>{Number(p.cantidad).toFixed(2)}€</span>
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

            {resumenPorAmigo.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 8 }}>RESUMEN POR AMIGO</div>
                {resumenPorAmigo.map(({ amigo, totalDebe, detalleDeudas, pagados }) => (
                  <div key={amigo.id} style={{
                    background: totalDebe > 0 ? '#FCEBEB' : '#EAF3DE',
                    borderRadius: 12, padding: '10px 14px', marginBottom: 8,
                    border: `1px solid ${totalDebe > 0 ? '#F09595' : '#C0DD97'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Av a={amigo} size={30} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: totalDebe > 0 ? '#791F1F' : '#27500A' }}>{amigo.nombre}</div>
                        {totalDebe > 0 && detalleDeudas.map((d, i) => (
                          <div key={i} style={{ fontSize: 11, color: '#A32D2D', marginTop: 2 }}>
                            Debe {d.cantidad.toFixed(2)}€ a {d.comprador?.nombre}
                          </div>
                        ))}
                        {totalDebe === 0 && <div style={{ fontSize: 11, color: '#3B6D11', marginTop: 2 }}>Todo pagado ✓</div>}
                      </div>
                      {totalDebe > 0 && (
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#E24B4A' }}>{totalDebe.toFixed(2)}€</div>
                      )}
                    </div>
                  </div>
                ))}
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
                    placeholder='Ej: 37.40' step='0.01' style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                </div>
                {formGasto.comprador_id && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>
                      ¿A quién le dio las entradas? <span style={{ color: '#7F77DD' }}>({formGasto.receptores.length} seleccionados)</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {amigosParaSeleccionar.map(a => {
                        const esComprador = a.id === formGasto.comprador_id
                        const seleccionado = esComprador || formGasto.receptores.includes(a.id)
                        return (
                          <div key={a.id} onClick={() => !esComprador && toggleReceptor(a.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 10, cursor: esComprador ? 'default' : 'pointer',
                            background: esComprador ? '#EAF3DE' : seleccionado ? '#EEEDFE' : '#f8f8f8',
                            border: esComprador ? '1px solid #C0DD97' : seleccionado ? '1px solid #AFA9EC' : '1px solid #eee',
                          }}>
                            <Avatar amigo={a} size={28} />
                            <span style={{ fontSize: 13, flex: 1, fontWeight: 500, color: esComprador ? '#27500A' : seleccionado ? '#3C3489' : 'var(--color-text-primary)' }}>{a.nombre}</span>
                            {esComprador
                              ? <span style={{ fontSize: 11, color: '#27500A', fontWeight: 500 }}>comprador ✓</span>
                              : <span style={{ fontSize: 16, color: seleccionado ? '#7F77DD' : '#ddd' }}>{seleccionado ? '✓' : '○'}</span>
                            }
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
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </div>
  )
}