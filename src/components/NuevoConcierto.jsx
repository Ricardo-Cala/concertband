import { useState } from 'react'
import { supabase } from '../supabase'

export default function NuevoConcierto({ amigos, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    artista: '', fecha: '', recinto: '', ciudad: '',
    hora_apertura: '', estado: 'pendiente',
    transporte_tipo: '', transporte_responsable: '',
    hotel_nombre: '', hotel_responsable: ''
  })
  const [guardando, setGuardando] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.artista || !form.fecha || !form.recinto || !form.ciudad) {
      alert('Rellena al menos: artista, fecha, recinto y ciudad')
      return
    }
    setGuardando(true)
    const { data: concierto, error } = await supabase
      .from('conciertos').insert([{
        artista: form.artista, fecha: form.fecha,
        recinto: form.recinto, ciudad: form.ciudad,
        hora_apertura: form.hora_apertura, estado: form.estado
      }]).select().single()

    if (error) { alert('Error al guardar: ' + error.message); setGuardando(false); return }

    if (form.transporte_tipo) {
      await supabase.from('transportes').insert([{
        concierto_id: concierto.id,
        tipo: form.transporte_tipo,
        responsable_id: form.transporte_responsable || null,
        confirmado: false
      }])
    }

    if (form.hotel_nombre) {
      await supabase.from('hoteles').insert([{
        concierto_id: concierto.id,
        nombre: form.hotel_nombre,
        responsable_id: form.hotel_responsable || null,
        reservado: false
      }])
    }

    setGuardando(false)
    onGuardado()
  }

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={tipo} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 8,
          border: '1px solid #ddd', fontSize: 14, background: 'white'
        }} />
    </div>
  )

  const select = (label, key) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <select value={form[key]} onChange={e => set(key, e.target.value)}
        style={{
          width: '100%', padding: '8px 10px', borderRadius: 8,
          border: '1px solid #ddd', fontSize: 14, background: 'white'
        }}>
        <option value=''>— Sin asignar —</option>
        {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>Nuevo concierto</h2>
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

      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>TRANSPORTE</div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Tipo</label>
          <select value={form.transporte_tipo} onChange={e => set('transporte_tipo', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
            <option value=''>— Sin definir —</option>
            <option value='Coche'>Coche</option>
            <option value='Tren'>Tren</option>
            <option value='AVE'>AVE</option>
            <option value='Avión'>Avión</option>
            <option value='Autobús'>Autobús</option>
          </select>
        </div>
        {select('Responsable de gestionar el transporte', 'transporte_responsable')}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>HOTEL</div>
        {campo('Nombre del hotel', 'hotel_nombre', 'text', 'Ej: NH Madrid Atocha')}
        {select('Responsable de la reserva', 'hotel_responsable')}
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        width: '100%', padding: '12px', borderRadius: 10,
        background: '#7F77DD', color: 'white', border: 'none',
        fontSize: 15, fontWeight: 500
      }}>
        {guardando ? 'Guardando...' : 'Guardar concierto'}
      </button>
    </div>
  )
}