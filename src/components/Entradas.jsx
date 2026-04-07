import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

export default function Entradas({ conciertos, amigos }) {
  const [concierto, setConcierto] = useState('')
  const [subtab, setSubtab] = useState('entradas')
  const [entradas, setEntradas] = useState([])
  const [gastos, setGastos] = useState([])
  const [pagos, setPagos] = useState([])
  const [asistentes, setAsistentes] = useState([])
  const [mostrarFormEntrada, setMostrarFormEntrada] = useState(false)
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
  const [formEntrada, setFormEntrada] = useState({ amigo_id: '', cantidad: 1, pagada: false })
  const [formGasto, setFormGasto] = useState({ comprador_id: '', precio_entrada: '', cantidad: 1 })

  // NUEVO: estado para el menú editar y modal subir entrada
  const [menuEditarId, setMenuEditarId] = useState(null)
  const [modalSubirEntrada, setModalSubirEntrada] = useState(null) // gasto_id
  const [modalEditarGasto, setModalEditarGasto] = useState(null)   // objeto gasto
  const [formEditarGasto, setFormEditarGasto] = useState({ comprador_id: '', precio_entrada: '', cantidad: 1 })
  const menuRef = useRef(null)

  useEffect(() => { if (concierto) cargarDatos() }, [concierto])

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuEditarId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const cargarDatos = async () => {
    const [e, a, g] = await Promise.all([
      supabase.from('entradas').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto),
      supabase.from('asistentes').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto).eq('confirmado', true),
      supabase.from('gastos').select('*, amigos(nombre, iniciales, color)').eq('concierto_id', concierto),
    ])
    setEntradas(e.data || [])
    setAsistentes(a.data || [])
    setGastos(g.data || [])
    if (g.data && g.data.length > 0) {
      const { data: p } = await supabase.from('pagos').select('*, amigos(nombre, iniciales, color)').in('gasto_id', g.data.map(x => x.id))
      setPagos(p || [])
    } else {
      setPagos([])
    }
  }

  const guardarEntrada = async () => {
    if (!formEntrada.amigo_id) { alert('Selecciona un amigo'); return }
    await supabase.from('entradas').insert([{ concierto_id: concierto, amigo_id: formEntrada.amigo_id, cantidad: parseInt(formEntrada.cantidad), pagada: formEntrada.pagada }])
    setMostrarFormEntrada(false)
    setFormEntrada({ amigo_id: '', cantidad: 1, pagada: false })
    cargarDatos()
  }

  const togglePagadaEntrada = async (e) => {
    await supabase.from('entradas').update({ pagada: !e.pagada }).eq('id', e.id)
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

  const guardarGasto = async () => {
    if (!formGasto.comprador_id || !formGasto.precio_entrada) { alert('Rellena comprador y precio'); return }
    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto,
      comprador_id: formGasto.comprador_id,
      precio_entrada: parseFloat(formGasto.precio_entrada),
      cantidad: parseInt(formGasto.cantidad),
    }]).select().single()
    if (gasto) {
      const otros = asistentes.filter(a => a.amigo_id !== formGasto.comprador_id)
      if (otros.length > 0) {
        await supabase.from('pagos').insert(otros.map(a => ({
          gasto_id: gasto.id, pagador_id: a.amigo_id,
          cantidad: parseFloat(formGasto.precio_entrada), pagado: false,
        })))
      }
    }
    setMostrarFormGasto(false)
    setFormGasto({ comprador_id: '', precio_entrada: '', cantidad: 1 })
    cargarDatos()
  }

  const togglePago = async (p) => {
    await supabase.from('pagos').update({ pagado: !p.pagado }).eq('id', p.id)
    cargarDatos()
  }

  const borrarGasto = async (id) => {
    if (!confirm('¿Eliminar esta compra y todos sus pagos?')) return
    await supabase.from('gastos').delete().eq('id', id)
    setMenuEditarId(null)
    cargarDatos()
  }

  // NUEVO: guardar edición de gasto
  const guardarEdicionGasto = async () => {
    if (!formEditarGasto.comprador_id || !formEditarGasto.precio_entrada) { alert('Rellena todos los campos'); return }
    await supabase.from('gastos').update({
      comprador_id: formEditarGasto.comprador_id,
      precio_entrada: parseFloat(formEditarGasto.precio_entrada),
      cantidad: parseInt(formEditarGasto.cantidad),
    }).eq('id', modalEditarGasto.id)
    setModalEditarGasto(null)
    cargarDatos()
  }

  // NUEVO: abrir modal editar
  const abrirEditarGasto = (g) => {
    setFormEditarGasto({ comprador_id: g.comprador_id, precio_entrada: g.precio_entrada, cantidad: g.cantidad })
    setModalEditarGasto(g)
    setMenuEditarId(null)
  }

  const amigosConEntrada = entradas.map(e => e.amigo_id)
  const amigosDisponibles = amigos.filter(a => !amigosConEntrada.includes(a.id))
  const totalEntradas = entradas.reduce((s, e) => s + e.cantidad, 0)
  const entradasPagadas = entradas.filter(e => e.pagada).reduce((s, e) => s + e.cantidad, 0)
  const totalComprado = gastos.reduce((s, g) => s + g.precio_entrada * g.cantidad, 0)
  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + p.cantidad, 0)
  const totalCobrado = pagos.filter(p => p.pagado).reduce((s, p) => s + p.cantidad, 0)

  const Av = ({ a, size = 32 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: a?.color, color: 'white', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 28 ? 12 : 9, fontWeight: 500,
    }}>{a?.iniciales}</div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>ENTRADAS Y PAGOS</div>

      <div style={{ marginBottom: 12 }}>
        <select value={concierto} onChange={e => setConcierto(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
          <option value=''>— Elige un concierto —</option>
          {conciertos.map(c => (
            <option key={c.id} value={c.id}>{c.artista} · {new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</option>
          ))}
        </select>
      </div>

      {concierto && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {['entradas', 'pagos'].map(t => (
              <button key={t} onClick={() => setSubtab(t)} style={{
                flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: subtab === t ? '#EEEDFE' : 'white',
                color: subtab === t ? '#3C3489' : '#888',
                border: subtab === t ? '1px solid #AFA9EC' : '1px solid #ddd',
              }}>{t === 'entradas' ? '🎟 Entradas' : '💸 Pagos'}</button>
            ))}
          </div>

          {subtab === 'entradas' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 500, color: '#3C3489' }}>{totalEntradas}</div>
                  <div style={{ fontSize: 10, color: '#534AB7' }}>Entradas totales</div>
                </div>
                <div style={{ background: entradasPagadas === totalEntradas && totalEntradas > 0 ? '#EAF3DE' : '#FAEEDA', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 500, color: entradasPagadas === totalEntradas && totalEntradas > 0 ? '#27500A' : '#633806' }}>{entradasPagadas}/{totalEntradas}</div>
                  <div style={{ fontSize: 10, color: entradasPagadas === totalEntradas && totalEntradas > 0 ? '#3B6D11' : '#854F0B' }}>Pagadas</div>
                </div>
              </div>

              {entradas.map(e => (
                <div key={e.id} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: `1px solid ${e.pagada ? '#C0DD97' : '#ddd'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Av a={e.amigos} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{e.amigos?.nombre}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <button onClick={() => cambiarCantidad(e, e.cantidad - 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>−</button>
                        <span style={{ fontSize: 13, minWidth: 20, textAlign: 'center' }}>{e.cantidad}</span>
                        <button onClick={() => cambiarCantidad(e, e.cantidad + 1)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
                        <span style={{ fontSize: 11, color: '#888' }}>entrada{e.cantidad > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <button onClick={() => togglePagadaEntrada(e)} style={{
                        padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                        background: e.pagada ? '#EAF3DE' : '#FAEEDA',
                        color: e.pagada ? '#27500A' : '#633806',
                      }}>{e.pagada ? '✓ Pagada' : '· Pendiente'}</button>
                      <button onClick={() => eliminarEntrada(e.id)} style={{ background: 'none', border: 'none', fontSize: 11, color: '#ccc', cursor: 'pointer' }}>quitar</button>
                    </div>
                  </div>
                </div>
              ))}

              {!mostrarFormEntrada && amigosDisponibles.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Añadir persona:</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {amigosDisponibles.map(a => (
                      <button key={a.id} onClick={() => { setFormEntrada(f => ({ ...f, amigo_id: a.id })); setMostrarFormEntrada(true) }} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                        borderRadius: 20, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer'
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: a.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500 }}>{a.iniciales}</div>
                        {a.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mostrarFormEntrada && (
                <div style={{ background: 'white', borderRadius: 12, padding: 14, marginTop: 12, border: '1px solid #7F77DD' }}>
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
            </div>
          )}

          {subtab === 'pagos' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#3C3489' }}>{totalComprado.toFixed(0)}€</div>
                  <div style={{ fontSize: 10, color: '#534AB7' }}>Total</div>
                </div>
                <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#791F1F' }}>{totalPendiente.toFixed(0)}€</div>
                  <div style={{ fontSize: 10, color: '#A32D2D' }}>Pendiente</div>
                </div>
                <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#27500A' }}>{totalCobrado.toFixed(0)}€</div>
                  <div style={{ fontSize: 10, color: '#3B6D11' }}>Cobrado</div>
                </div>
              </div>

              {gastos.length === 0 && !mostrarFormGasto && (
                <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888', marginBottom: 12 }}>
                  Sin compras registradas aún
                </div>
              )}

              {gastos.map(g => {
                const pg = pagos.filter(p => p.gasto_id === g.id)
                const pendientes = pg.filter(p => !p.pagado)
                const cobrados = pg.filter(p => p.pagado)
                return (
                  <div key={g.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, border: '1px solid #eee' }}>
                    
                    {/* CABECERA DE TARJETA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <Av a={g.amigos} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{g.amigos?.nombre} compró</div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {g.cantidad} entrada{g.cantidad > 1 ? 's' : ''} · {g.precio_entrada}€ c/u ·{' '}
                          <span style={{ fontWeight: 500, color: '#534AB7' }}>{(g.precio_entrada * g.cantidad).toFixed(0)}€ total</span>
                        </div>
                      </div>

                      {/* BOTONES: Subir entrada + Editar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }} ref={menuEditarId === g.id ? menuRef : null}>
                        
                        {/* BOTÓN ÚNICO "Subir entrada" con dropdown */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setModalSubirEntrada(modalSubirEntrada === g.id ? null : g.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '5px 10px', borderRadius: 8,
                              border: '1px solid #AFA9EC', background: '#EEEDFE',
                              color: '#3C3489', fontSize: 12, fontWeight: 500, cursor: 'pointer'
                            }}>
                            🎟 Subir entrada ▾
                          </button>
                          {modalSubirEntrada === g.id && (
                            <div style={{
                              position: 'absolute', top: '110%', right: 0, zIndex: 100,
                              background: 'white', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                              border: '1px solid #eee', minWidth: 160, overflow: 'hidden'
                            }}>
                              <button onClick={() => { alert('Función: subir archivo de entrada'); setModalSubirEntrada(null) }}
                                style={{ width: '100%', padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                📎 Subir archivo
                              </button>
                              <div style={{ height: 1, background: '#f0f0f0' }} />
                              <button onClick={() => { alert('Función: pegar imagen'); setModalSubirEntrada(null) }}
                                style={{ width: '100%', padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                📋 Pegar imagen
                              </button>
                            </div>
                          )}
                        </div>

                        {/* BOTÓN EDITAR con dropdown */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={() => setMenuEditarId(menuEditarId === g.id ? null : g.id)}
                            style={{
                              padding: '5px 10px', borderRadius: 8,
                              border: '1px solid #ddd', background: 'white',
                              color: '#555', fontSize: 12, fontWeight: 500, cursor: 'pointer'
                            }}>
                            ✏️ Editar ▾
                          </button>
                          {menuEditarId === g.id && (
                            <div style={{
                              position: 'absolute', top: '110%', right: 0, zIndex: 100,
                              background: 'white', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                              border: '1px solid #eee', minWidth: 160, overflow: 'hidden'
                            }}>
                              <button onClick={() => abrirEditarGasto(g)}
                                style={{ width: '100%', padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                ✏️ Modificar datos
                              </button>
                              <div style={{ height: 1, background: '#f0f0f0' }} />
                              <button onClick={() => borrarGasto(g.id)}
                                style={{ width: '100%', padding: '11px 14px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, color: '#E24B4A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                🗑️ Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {pendientes.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: '#A32D2D', marginBottom: 6, fontWeight: 500 }}>DEBEN PAGAR A {g.amigos?.nombre.toUpperCase()}</div>
                        {pendientes.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <Av a={p.amigos} size={26} />
                            <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                            <span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{p.cantidad}€</span>
                            <button onClick={() => togglePago(p)} style={{ padding: '3px 10px', borderRadius: 20, border: 'none', background: '#FCEBEB', color: '#791F1F', fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>· Pendiente</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {cobrados.length > 0 && (
                      <div>
                        <div style={{ fontSize: 10, color: '#3B6D11', marginBottom: 6, fontWeight: 500 }}>YA PAGARON</div>
                        {cobrados.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: 0.6 }}>
                            <Av a={p.amigos} size={26} />
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

              {/* MODAL EDITAR GASTO */}
              {modalEditarGasto && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}>
                  <div style={{ background: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3C3489', marginBottom: 16 }}>✏️ MODIFICAR COMPRA</div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>¿Quién compró?</label>
                      <select value={formEditarGasto.comprador_id} onChange={e => setFormEditarGasto(f => ({ ...f, comprador_id: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
                        <option value=''>— Selecciona —</option>
                        {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Precio por entrada (€)</label>
                      <input type='number' value={formEditarGasto.precio_entrada}
                        onChange={e => setFormEditarGasto(f => ({ ...f, precio_entrada: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Entradas compradas</label>
                      <input type='number' value={formEditarGasto.cantidad} min='1'
                        onChange={e => setFormEditarGasto(f => ({ ...f, cantidad: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setModalEditarGasto(null)}
                        style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13 }}>
                        Cancelar
                      </button>
                      <button onClick={guardarEdicionGasto}
                        style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500 }}>
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mostrarFormGasto && (
                <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid #7F77DD' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>NUEVO COMPRADOR</div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>¿Quién compró?</label>
                    <select value={formGasto.comprador_id} onChange={e => setFormGasto(f => ({ ...f, comprador_id: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
                      <option value=''>— Selecciona —</option>
                      {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Precio por entrada (€)</label>
                    <input type='number' value={formGasto.precio_entrada} onChange={e => setFormGasto(f => ({ ...f, precio_entrada: e.target.value }))}
                      placeholder='Ej: 65' style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Entradas compradas</label>
                    <input type='number' value={formGasto.cantidad} min='1' onChange={e => setFormGasto(f => ({ ...f, cantidad: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setMostrarFormGasto(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13 }}>Cancelar</button>
                    <button onClick={guardarGasto} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500 }}>Guardar</button>
                  </div>
                </div>
              )}

              {!mostrarFormGasto && (
                <button onClick={() => setMostrarFormGasto(true)} style={{ width: '100%', padding: 12, borderRadius: 10, background: 'white', color: '#7F77DD', border: '1px solid #7F77DD', fontSize: 14, fontWeight: 500 }}>
                  + Añadir comprador
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}