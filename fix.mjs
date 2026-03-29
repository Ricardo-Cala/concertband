import { writeFileSync } from 'fs'

const code = `import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Gastos({ conciertos, amigos }) {
  const [concierto, setConcierto] = useState('')
  const [gastos, setGastos] = useState([])
  const [pagos, setPagos] = useState([])
  const [asistentes, setAsistentes] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [form, setForm] = useState({ comprador_id: '', precio_entrada: '', cantidad: 1 })

  useEffect(() => { if (concierto) cargarDatos() }, [concierto])

  const cargarDatos = async () => {
    const { data: gastosData } = await supabase
      .from('gastos')
      .select('*, amigos(nombre, iniciales, color)')
      .eq('concierto_id', concierto)
    const { data: asistentesData } = await supabase
      .from('asistentes')
      .select('*, amigos(nombre, iniciales, color)')
      .eq('concierto_id', concierto)
      .eq('confirmado', true)
    setGastos(gastosData || [])
    setAsistentes(asistentesData || [])
    if (gastosData && gastosData.length > 0) {
      const ids = gastosData.map(g => g.id)
      const { data: pagosData } = await supabase
        .from('pagos')
        .select('*, amigos(nombre, iniciales, color)')
        .in('gasto_id', ids)
      setPagos(pagosData || [])
    } else {
      setPagos([])
    }
  }

  const guardarGasto = async () => {
    if (!form.comprador_id || !form.precio_entrada) {
      alert('Rellena comprador y precio')
      return
    }
    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto,
      comprador_id: form.comprador_id,
      precio_entrada: parseFloat(form.precio_entrada),
      cantidad: parseInt(form.cantidad),
    }]).select().single()
    if (gasto) {
      const otros = asistentes.filter(a => a.amigo_id !== form.comprador_id)
      if (otros.length > 0) {
        await supabase.from('pagos').insert(
          otros.map(a => ({
            gasto_id: gasto.id,
            pagador_id: a.amigo_id,
            cantidad: parseFloat(form.precio_entrada),
            pagado: false,
          }))
        )
      }
    }
    setMostrarForm(false)
    setForm({ comprador_id: '', precio_entrada: '', cantidad: 1 })
    cargarDatos()
  }

  const togglePago = async (pago) => {
    await supabase.from('pagos').update({ pagado: !pago.pagado }).eq('id', pago.id)
    cargarDatos()
  }

  const borrarGasto = async (id) => {
    await supabase.from('gastos').delete().eq('id', id)
    cargarDatos()
  }

  const totalComprado = gastos.reduce((s, g) => s + g.precio_entrada * g.cantidad, 0)
  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + p.cantidad, 0)
  const totalCobrado = pagos.filter(p => p.pagado).reduce((s, p) => s + p.cantidad, 0)

  const Av = ({ a, size = 32 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: a?.color, color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 28 ? 11 : 9, fontWeight: 500, flexShrink: 0
    }}>{a?.iniciales}</div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>GASTOS</div>
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

      {concierto && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#3C3489' }}>{totalComprado.toFixed(0)}€</div>
              <div style={{ fontSize: 10, color: '#534AB7' }}>Total pagado</div>
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

          {gastos.length === 0 && !mostrarForm && (
            <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888', marginBottom: 12 }}>
              Sin compras registradas aún
            </div>
          )}

          {gastos.map(g => {
            const pagosGasto = pagos.filter(p => p.gasto_id === g.id)
            const pendientes = pagosGasto.filter(p => !p.pagado)
            const cobrados = pagosGasto.filter(p => p.pagado)
            return (
              <div key={g.id} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Av a={g.amigos} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{g.amigos?.nombre} compró</div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {g.cantidad} entrada{g.cantidad > 1 ? 's' : ''} · {g.precio_entrada}€ c/u · <span style={{ fontWeight: 500, color: '#534AB7' }}>{(g.precio_entrada * g.cantidad).toFixed(0)}€ total</span>
                    </div>
                  </div>
                  <button onClick={() => borrarGasto(g.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#ccc' }}>🗑️</button>
                </div>
                {pendientes.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: '#A32D2D', marginBottom: 6, fontWeight: 500 }}>DEBEN PAGAR</div>
                    {pendientes.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Av a={p.amigos} size={26} />
                        <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                        <span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{p.cantidad}€</span>
                        <button onClick={() => togglePago(p)} style={{
                          padding: '3px 10px', borderRadius: 20, border: 'none',
                          background: '#FCEBEB', color: '#791F1F', fontSize: 11, fontWeight: 500, cursor: 'pointer'
                        }}>· Pendiente</button>
                      </div>
                    ))}
                  </div>
                )}
                {cobrados.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#3B6D11', marginBottom: 6, fontWeight: 500 }}>YA PAGARON</div>
                    {cobrados.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: 0.6 }}>
                        <Av a={p.amigos} size={26} />
                        <span style={{ fontSize: 13, flex: 1 }}>{p.amigos?.nombre}</span>
                        <span style={{ fontSize: 12, color: '#3B6D11', fontWeight: 500 }}>{p.cantidad}€</span>
                        <button onClick={() => togglePago(p)} style={{
                          padding: '3px 10px', borderRadius: 20, border: 'none',
                          background: '#EAF3DE', color: '#27500A', fontSize: 11, fontWeight: 500, cursor: 'pointer'
                        }}>✓ Pagado</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {mostrarForm && (
            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid #7F77DD' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>NUEVO COMPRADOR</div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>¿Quién compró?</label>
                <select value={form.comprador_id} onChange={e => setForm(f => ({ ...f, comprador_id: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
                  <option value=''>— Selecciona —</option>
                  {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Precio por entrada (€)</label>
                <input type='number' value={form.precio_entrada}
                  onChange={e => setForm(f => ({ ...f, precio_entrada: e.target.value }))}
                  placeholder='Ej: 65'
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Entradas compradas</label>
                <input type='number' value={form.cantidad} min='1'
                  onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setMostrarForm(false)} style={{
                  flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13
                }}>Cancelar</button>
                <button onClick={guardarGasto} style={{
                  flex: 1, padding: 10, borderRadius: 8, border: 'none',
                  background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500
                }}>Guardar</button>
              </div>
            </div>
          )}

          {!mostrarForm && (
            <button onClick={() => setMostrarForm(true)} style={{
              width: '100%', padding: 12, borderRadius: 10,
              background: 'white', color: '#7F77DD',
              border: '1px solid #7F77DD', fontSize: 14, fontWeight: 500
            }}>+ Añadir comprador</button>
          )}
        </div>
      )}
    </div>
  )
}`

writeFileSync('src/components/Gastos.jsx', code)
console.log('Gastos.jsx escrito correctamente')