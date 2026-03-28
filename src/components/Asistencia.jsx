import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Asistencia({ conciertos, amigos }) {
  const [concierto, setConcierto] = useState('')
  const [asistentes, setAsistentes] = useState([])

  useEffect(() => {
    if (concierto) cargarAsistentes()
  }, [concierto])

  const cargarAsistentes = async () => {
    const { data } = await supabase
      .from('asistentes')
      .select('*, amigos(nombre, iniciales, color)')
      .eq('concierto_id', concierto)
    if (data) setAsistentes(data)
  }

  const getEstado = (amigoId) => {
    const a = asistentes.find(a => a.amigo_id === amigoId)
    if (!a) return 'pendiente'
    if (a.confirmado === true) return 'va'
    if (a.confirmado === false && a.id) return 'nova'
    return 'pendiente'
  }

  const setEstado = async (amigoId, estado) => {
    const existente = asistentes.find(a => a.amigo_id === amigoId)

    if (estado === 'pendiente') {
      if (existente) {
        await supabase.from('asistentes').delete().eq('id', existente.id)
      }
    } else if (existente) {
      await supabase.from('asistentes')
        .update({ confirmado: estado === 'va' })
        .eq('id', existente.id)
    } else {
      await supabase.from('asistentes').insert([{
        concierto_id: concierto,
        amigo_id: amigoId,
        confirmado: estado === 'va'
      }])
    }
    cargarAsistentes()
  }

  const van = amigos.filter(a => getEstado(a.id) === 'va').length
const novan = amigos.filter(a => getEstado(a.id) === 'nova').length
const pendientes = amigos.filter(a => getEstado(a.id) === 'pendiente').length

  const BtnEstado = ({ actual, valor, label, bg, color }) => (
    <button onClick={() => setEstado(actual, valor)} style={{
      padding: '4px 10px', borderRadius: 20, border: 'none',
      fontSize: 11, fontWeight: 500, cursor: 'pointer',
      background: bg, color,
      opacity: getEstado(actual) === valor ? 1 : 0.35,
      transition: 'opacity 0.15s'
    }}>{label}</button>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 12 }}>ASISTENCIA</div>

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
            <div style={{ background: '#EAF3DE', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#27500A' }}>{van}</div>
              <div style={{ fontSize: 10, color: '#3B6D11' }}>Van</div>
            </div>
            <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#791F1F' }}>{novan}</div>
              <div style={{ fontSize: 10, color: '#A32D2D' }}>No van</div>
            </div>
            <div style={{ background: '#FAEEDA', borderRadius: 10, padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#633806' }}>{pendientes}</div>
              <div style={{ fontSize: 10, color: '#854F0B' }}>Pendientes</div>
            </div>
          </div>

          {amigos.map(a => (
            <div key={a.id} style={{
              background: 'white', borderRadius: 12, padding: '12px 14px',
              marginBottom: 8, border: '1px solid #eee',
              borderLeft: `3px solid ${getEstado(a.id) === 'va' ? '#639922' : getEstado(a.id) === 'nova' ? '#E24B4A' : '#FAC775'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: a.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 500, flexShrink: 0
                }}>{a.iniciales}</div>

                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{a.nombre}</div>

                <div style={{ display: 'flex', gap: 5 }}>
                  <BtnEstado actual={a.id} valor='va' label='✓ Va'
                    bg='#EAF3DE' color='#27500A' />
                  <BtnEstado actual={a.id} valor='nova' label='✕ No va'
                    bg='#FCEBEB' color='#791F1F' />
                  <BtnEstado actual={a.id} valor='pendiente' label='? Pendiente'
                    bg='#FAEEDA' color='#633806' />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}