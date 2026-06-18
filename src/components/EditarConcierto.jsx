import { useState, useEffect } from 'react'
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

  const inputNeu = {
    width: '100%', padding: '11px 14px', borderRadius: 12, border: 'none',
    background: 'var(--bg)',
    boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
    fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelNeu = {
    fontSize: 10, color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
    fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
  }
  const seccionTitulo = {
    fontSize: 10, fontWeight: 700, color: 'var(--sage-dark)',
    marginBottom: 16, letterSpacing: '0.25em', textTransform: 'uppercase',
  }

  const campo = (label, value, setter, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelNeu}>{label}</label>
      <input type={tipo} value={value} placeholder={placeholder}
        onChange={e => setter(e.target.value)} style={inputNeu} />
    </div>
  )

  const selectAmigo = (label, value, setter) => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelNeu}>{label}</label>
      <select value={value} onChange={e => setter(e.target.value)} style={inputNeu}>
        <option value=''>— Sin asignar —</option>
        {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
      </select>
    </div>
  )

  const toggle = (label, value, setter) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</label>
      <button onClick={() => setter(!value)} style={{
        padding: '5px 14px', borderRadius: 20, border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'inherit', letterSpacing: '0.12em', textTransform: 'uppercase',
        background: value
          ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
          : 'var(--bg)',
        color: value ? 'var(--warm-grey)' : 'var(--text-secondary)',
        boxShadow: value
          ? '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)'
          : 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
      }}>{value ? '✓ Sí' : '· No'}</button>
    </div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Editar concierto</h2>
        <button onClick={onCancelar} style={{
          background: 'var(--bg)', border: 'none', borderRadius: '50%',
          width: 36, height: 36, fontSize: 16, color: 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        }}>✕</button>
      </div>

      <div style={{
        background: 'var(--bg)', borderRadius: 20, padding: 20, marginBottom: 14,
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      }}>
        <div style={seccionTitulo}>Concierto</div>
        {campo('Artista *', form.artista, v => set('artista', v), 'text', 'Ej: Metallica')}
        {campo('Fecha *', form.fecha, v => set('fecha', v), 'date')}
        {campo('Recinto *', form.recinto, v => set('recinto', v), 'text', 'Ej: Palau Sant Jordi')}
        {campo('Ciudad *', form.ciudad, v => set('ciudad', v), 'text', 'Ej: Barcelona')}
        {campo('Hora apertura', form.hora_apertura, v => set('hora_apertura', v), 'time')}
        <div style={{ marginBottom: 14 }}>
          <label style={labelNeu}>Estado</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)} style={inputNeu}>
            <option value='pendiente'>Pendiente</option>
            <option value='confirmado'>Confirmado</option>
          </select>
        </div>
      </div>

      <div style={{
        background: 'var(--bg)', borderRadius: 20, padding: 20, marginBottom: 14,
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      }}>
        <div style={seccionTitulo}>Transporte</div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelNeu}>Tipo</label>
          <select value={formTransporte.tipo} onChange={e => setT('tipo', e.target.value)} style={inputNeu}>
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

      <div style={{
        background: 'var(--bg)', borderRadius: 20, padding: 20, marginBottom: 20,
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      }}>
        <div style={seccionTitulo}>Hotel</div>
        {campo('Nombre del hotel', formHotel.nombre, v => setH('nombre', v), 'text', 'Ej: NH Madrid Atocha')}
        {selectAmigo('Responsable de la reserva', formHotel.responsable_id, v => setH('responsable_id', v))}
        {toggle('Reservado', formHotel.reservado, v => setH('reservado', v))}
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        width: '100%', padding: 14, borderRadius: 16,
        background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
        color: 'var(--warm-grey)', border: 'none',
        fontSize: 11, fontWeight: 700, cursor: 'pointer',
        letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
        boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
        fontFamily: 'inherit',
      }}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {!confirmaBorrar ? (
        <button onClick={() => setConfirmaBorrar(true)} style={{
          width: '100%', padding: 14, borderRadius: 16, cursor: 'pointer',
          background: 'var(--bg)', color: '#B85C5C', border: 'none',
          fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
        }}>Eliminar concierto</button>
      ) : (
        <div style={{
          background: 'linear-gradient(145deg, #E8D8D8, #D8C6C6)',
          borderRadius: 20, padding: 18, textAlign: 'center',
          boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 12, color: '#6B3333', marginBottom: 16, fontWeight: 600, letterSpacing: '0.04em' }}>
            ¿Seguro? Se borrarán también las entradas, asistencia, hotel y transporte.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirmaBorrar(false)} style={{
              flex: 1, padding: 12, borderRadius: 14, border: 'none',
              background: 'var(--bg)', color: 'var(--text-secondary)',
              fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
            }}>Cancelar</button>
            <button onClick={borrar} style={{
              flex: 1, padding: 12, borderRadius: 14, border: 'none',
              background: 'linear-gradient(145deg, #C87070, #A85050)',
              color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
            }}>Sí, eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}
