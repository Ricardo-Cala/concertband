import { useState } from 'react'
import { supabase } from '../supabase'

export default function EditarConcierto({ concierto, amigos, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    artista: concierto.artista || '',
    fecha: concierto.fecha || '',
    recinto: concierto.recinto || '',
    ciudad: concierto.ciudad || '',
    hora_apertura: concierto.hora_apertura || '',
    estado: concierto.estado || 'pendiente',
  })
  const [guardando, setGuardando] = useState(false)
  const [confirmaBorrar, setConfirmaBorrar] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.artista || !form.fecha || !form.recinto || !form.ciudad) {
      alert('Rellena al menos: artista, fecha, recinto y ciudad')
      return
    }
    setGuardando(true)
    await supabase.from('conciertos').update({
      artista: form.artista,
      fecha: form.fecha,
      recinto: form.recinto,
      ciudad: form.ciudad,
      hora_apertura: form.hora_apertura,
      estado: form.estado,
    }).eq('id', concierto.id)
    setGuardando(false)
    onGuardado()
  }

  const borrar = async () => {
    await supabase.from('conciertos').delete().eq('id', concierto.id)
    onGuardado()
  }

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={tipo} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }} />
    </div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>Editar concierto</h2>
        <button onClick={onCancelar} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888' }}>✕</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>CONCIERTO</div>
        {campo('Artista *', 'artista', 'text', 'Ej: Metallica')}
        {campo('Fecha *', 'fecha', 'date')}
        {campo('Recinto *', 'recinto', 'text', 'Ej: Palau Sant Jordi')}
        {campo('Ciudad *', 'ciudad', 'text', 'Ej: Barcelona')}
        {campo('Hora apertura', 'hora_apertura', 'time')}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Estado</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
            <option value='pendiente'>Pendiente</option>
            <option value='confirmado'>Confirmado</option>
          </select>
        </div>
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        width: '100%', padding: 12, borderRadius: 10,
        background: '#7F77DD', color: 'white', border: 'none',
        fontSize: 15, fontWeight: 500, marginBottom: 12
      }}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {!confirmaBorrar ? (
        <button onClick={() => setConfirmaBorrar(true)} style={{
          width: '100%', padding: 12, borderRadius: 10,
          background: 'white', color: '#E24B4A',
          border: '1px solid #E24B4A', fontSize: 14
        }}>
          Eliminar concierto
        </button>
      ) : (
        <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#791F1F', marginBottom: 12 }}>
            ¿Seguro? Se borrarán también las entradas, asistencia, hotel y transporte de este concierto.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmaBorrar(false)} style={{
              flex: 1, padding: 10, borderRadius: 8,
              background: 'white', border: '1px solid #ddd', fontSize: 13
            }}>Cancelar</button>
            <button onClick={borrar} style={{
              flex: 1, padding: 10, borderRadius: 8,
              background: '#E24B4A', color: 'white', border: 'none', fontSize: 13, fontWeight: 500
            }}>Sí, eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}