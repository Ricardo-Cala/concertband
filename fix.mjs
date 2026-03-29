import { writeFileSync } from 'fs'

const code = `import { useState, useEffect } from 'react'
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
  const [transporte, setTransporte] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [formTransporte, setFormTransporte] = useState({ tipo: '', responsable_id: '', confirmado: false })
  const [formHotel, setFormHotel] = useState({ nombre: '', responsable_id: '', reservado: false })
  const [guardando, setGuardando] = useState(false)
  const [confirmaBorrar, setConfirmaBorrar] = useState(false)

  useEffect(() => { cargarExtras() }, [])

  const cargarExtras = async () => {
    const [t, h] = await Promise.all([
      supabase.from('transportes').select('*').eq('concierto_id', concierto.id).single(),
      supabase.from('hoteles').select('*').eq('concierto_id', concierto.id).single(),
    ])
    if (t.data) {
      setTransporte(t.data)
      setFormTransporte({ tipo: t.data.tipo || '', responsable_id: t.data.responsable_id || '', confirmado: t.data.confirmado || false })
    }
    if (h.data) {
      setHotel(h.data)
      setFormHotel({ nombre: h.data.nombre || '', responsable_id: h.data.responsable_id || '', reservado: h.data.reservado || false })
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setT = (k, v) => setFormTransporte(f => ({ ...f, [k]: v }))
  const setH = (k, v) => setFormHotel(f => ({ ...f, [k]: v }))

  const guardar = async () => {
    if (!form.artista || !form.fecha || !form.recinto || !form.ciudad) {
      alert('Rellena al menos: artista, fecha, recinto y ciudad')
      return
    }
    setGuardando(true)
    await supabase.from('conciertos').update({
      artista: form.artista, fecha: form.fecha,
      recinto: form.recinto, ciudad: form.ciudad,
      hora_apertura: form.hora_apertura, estado: form.estado,
    }).eq('id', concierto.id)
    if (formTransporte.tipo) {
      if (transporte) {
        await supabase.from('transportes').update({
          tipo: formTransporte.tipo,
          responsable_id: formTransporte.responsable_id || null,
          confirmado: formTransporte.confirmado,
        }).eq('id', transporte.id)
      } else {
        await supabase.from('transportes').insert([{
          concierto_id: concierto.id,
          tipo: formTransporte.tipo,
          responsable_id: formTransporte.responsable_id || null,
          confirmado: formTransporte.confirmado,
        }])
      }
    } else if (transporte) {
      await supabase.from('transportes').delete().eq('id', transporte.id)
    }
    if (formHotel.nombre) {
      if (hotel) {
        await supabase.from('hoteles').update({
          nombre: formHotel.nombre,
          responsable_id: formHotel.responsable_id || null,
          reservado: formHotel.reservado,
        }).eq('id', hotel.id)
      } else {
        await supabase.from('hoteles').insert([{
          concierto_id: concierto.id,
          nombre: formHotel.nombre,
          responsable_id: formHotel.responsable_id || null,
          reservado: formHotel.reservado,
        }])
      }
    } else if (hotel) {
      await supabase.from('hoteles').delete().eq('id', hotel.id)
    }
    setGuardando(false)
    onGuardado()
  }

  const borrar = async () => {
    await supabase.from('conciertos').delete().eq('id', concierto.id)
    onGuardado()
  }

  const campo = (label, key, setter, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={tipo} value={key} placeholder={placeholder}
        onChange={e => setter(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }} />
    </div>
  )

  const selectAmigo = (label, value, setter) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <select value={value} onChange={e => setter(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
        <option value=''>— Sin asignar —</option>
        {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
      </select>
    </div>
  )

  const toggle = (label, value, setter) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <label style={{ fontSize: 13, color: '#444' }}>{label}</label>
      <button onClick={() => setter(!value)} style={{
        padding: '4px 14px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
        background: value ? '#EAF3DE' : '#f0f0f0',
        color: value ? '#27500A' : '#888',
      }}>{value ? '✓ Sí' : '· No'}</button>
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
        {campo('Artista *', form.artista, v => set('artista', v), 'text', 'Ej: Metallica')}
        {campo('Fecha *', form.fecha, v => set('fecha', v), 'date')}
        {campo('Recinto *', form.recinto, v => set('recinto', v), 'text', 'Ej: Palau Sant Jordi')}
        {campo('Ciudad *', form.ciudad, v => set('ciudad', v), 'text', 'Ej: Barcelona')}
        {campo('Hora apertura', form.hora_apertura, v => set('hora_apertura', v), 'time')}
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
          <select value={formTransporte.tipo} onChange={e => setT('tipo', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
            <option value=''>— Sin definir —</option>
            <option value='Coche'>Coche</option>
            <option value='Tren'>Tren</option>
            <option value='AVE'>AVE</option>
            <option value='Avión'>Avión</option>
            <option value='Autobús'>Autobús</option>
          </select>
        </div>
        {selectAmigo('Responsable', formTransporte.responsable_id, v => setT('responsable_id', v))}
        {toggle('Confirmado', formTransporte.confirmado, v => setT('confirmado', v))}
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>HOTEL</div>
        {campo('Nombre del hotel', formHotel.nombre, v => setH('nombre', v), 'text', 'Ej: NH Madrid Atocha')}
        {selectAmigo('Responsable de la reserva', formHotel.responsable_id, v => setH('responsable_id', v))}
        {toggle('Reservado', formHotel.reservado, v => setH('reservado', v))}
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
        }}>Eliminar concierto</button>
      ) : (
        <div style={{ background: '#FCEBEB', borderRadius: 10, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#791F1F', marginBottom: 12 }}>
            ¿Seguro? Se borrarán también las entradas, asistencia, hotel y transporte.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmaBorrar(false)} style={{
              flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13
            }}>Cancelar</button>
            <button onClick={borrar} style={{
              flex: 1, padding: 10, borderRadius: 8, border: 'none',
              background: '#E24B4A', color: 'white', fontSize: 13, fontWeight: 500
            }}>Sí, eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}`

writeFileSync('src/components/EditarConcierto.jsx', code)
console.log('Archivo escrito: ' + code.split('\n').length + ' líneas')