import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Entradas({ conciertos, amigos }) {
  const [concierto, setConcierto] = useState('')
  const [entradas, setEntradas] = useState([])

  useEffect(() => {
    if (concierto) cargarEntradas()
  }, [concierto])

  const cargarEntradas = async () => {
    const { data } = await supabase
      .from('entradas')
      .select('*, amigos(nombre, iniciales, color)')
      .eq('concierto_id', concierto)
    if (data) setEntradas(data)
  }

  const togglePagada = async (entrada) => {
    await supabase
      .from('entradas')
      .update({ pagada: !entrada.pagada })
      .eq('id', entrada.id)
    cargarEntradas()
  }

  const añadirEntrada = async (amigoId) => {
    const yaExiste = entradas.find(e => e.amigo_id === amigoId)
    if (yaExiste) return
    await supabase.from('entradas').insert([{
      concierto_id: concierto,
      amigo_id: amigoId,
      cantidad: 1,
      pagada: false
    }])
    cargarEntradas()
  }

  const cambiarCantidad = async (entrada, cantidad) => {
    if (cantidad < 1) return
    await supabase
      .from('entradas')
      .update({ cantidad })
      .eq('id', entrada.id)
    cargarEntradas()
  }

  const eliminarEntrada = async (id) => {
    await supabase.from('entradas').delete().eq('id', id)
    cargarEntradas()
  }

  const amigosConEntrada = entradas.map(e => e.amigo_id)
  const amigosDisponibles = amigos.filter(a => !amigosConEntrada.includes(a.id))
  const totalEntradas = entradas.reduce((s, e) => s + e.cantidad, 0)
  const totalPagadas = entradas.filter(e => e.pagada).reduce((s, e) => s + e.cantidad, 0)

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>ENTRADAS</div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Selecciona el concierto</label>
        <select value={concierto} onChange={e => setConcierto(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
          <option value=''>— Elige un concierto —</option>
          {conciertos.map(c => (
            <option key={c.id} value={c.id}>
              {c.artista} · {new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </option>
          ))}
        </select>
      </div>

      {concierto && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#EEEDFE', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#3C3489' }}>{totalEntradas}</div>
              <div style={{ fontSize: 11, color: '#534AB7' }}>Entradas totales</div>
            </div>
            <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#27500A' }}>{totalPagadas}</div>
              <div style={{ fontSize: 11, color: '#3B6D11' }}>Pagadas</div>
            </div>
          </div>

          {entradas.map(e => (
            <div key={e.id} style={{
              background: 'white', borderRadius: 12, padding: '12px 14px',
              marginBottom: 8, border: `1px solid ${e.pagada ? '#C0DD97' : '#ddd'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: e.amigos?.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 500, flexShrink: 0
                }}>{e.amigos?.iniciales}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{e.amigos?.nombre}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <button onClick={() => cambiarCantidad(e, e.cantidad - 1)}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ fontSize: 13, minWidth: 20, textAlign: 'center' }}>{e.cantidad}</span>
                    <button onClick={() => cambiarCantidad(e, e.cantidad + 1)}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid #ddd', background: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <span style={{ fontSize: 11, color: '#888' }}>entrada{e.cantidad > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <button onClick={() => togglePagada(e)} style={{
                    padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    background: e.pagada ? '#EAF3DE' : '#FAEEDA',
                    color: e.pagada ? '#27500A' : '#633806'
                  }}>
                    {e.pagada ? '✓ Pagada' : '· Pendiente'}
                  </button>
                  <button onClick={() => eliminarEntrada(e.id)}
                    style={{ background: 'none', border: 'none', fontSize: 11, color: '#ccc', cursor: 'pointer' }}>
                    quitar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {amigosDisponibles.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Añadir persona:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {amigosDisponibles.map(a => (
                  <button key={a.id} onClick={() => añadirEntrada(a.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 20,
                    border: '1px solid #ddd', background: 'white',
                    fontSize: 13, cursor: 'pointer'
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: a.color, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 500
                    }}>{a.iniciales}</div>
                    {a.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}