import { useState, useMemo } from 'react'
import { supabase } from '../supabase'

const normalizar = (txt) => (txt || '')
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()

export default function NuevoConcierto({ amigos, conciertos = [], onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    artista: '', fecha: '', recinto: '', ciudad: '',
    hora_apertura: '', estado: 'pendiente',
    transporte_tipo: '', transporte_responsable: '',
    hotel_nombre: '', hotel_responsable: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [foco, setFoco] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const listaArtistas = useMemo(() => {
    const map = {}
    ;(conciertos || []).forEach(c => {
      if (!c.artista) return
      const clave = normalizar(c.artista)
      if (!map[clave]) map[clave] = c.artista.trim()
    })
    return Object.values(map).sort((a, b) => a.localeCompare(b, 'es'))
  }, [conciertos])

  const listaCiudades = useMemo(() => {
    const map = {}
    ;(conciertos || []).forEach(c => {
      if (!c.ciudad) return
      const clave = normalizar(c.ciudad)
      if (!map[clave]) map[clave] = c.ciudad.trim()
    })
    return Object.values(map).sort((a, b) => a.localeCompare(b, 'es'))
  }, [conciertos])

  const sugerenciasArtista = useMemo(() => {
    const q = normalizar(form.artista)
    if (!q) return []
    return listaArtistas
      .filter(a => normalizar(a).includes(q) && normalizar(a) !== q)
      .slice(0, 5)
  }, [form.artista, listaArtistas])

  const sugerenciasCiudad = useMemo(() => {
    const q = normalizar(form.ciudad)
    if (!q) return []
    return listaCiudades
      .filter(c => normalizar(c).includes(q) && normalizar(c) !== q)
      .slice(0, 5)
  }, [form.ciudad, listaCiudades])

  const guardar = async () => {
    if (!form.artista || !form.fecha || !form.recinto || !form.ciudad) {
      alert('Rellena al menos: artista, fecha, recinto y ciudad')
      return
    }
    const artistaFinal = listaArtistas.find(a => normalizar(a) === normalizar(form.artista)) || form.artista.trim()
    const ciudadFinal  = listaCiudades.find(c => normalizar(c) === normalizar(form.ciudad))  || form.ciudad.trim()
    setGuardando(true)
    const { data: concierto, error } = await supabase
      .from('conciertos').insert([{
        artista: artistaFinal, fecha: form.fecha,
        recinto: form.recinto, ciudad: ciudadFinal,
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

  const campoAutocompletar = (label, key, placeholder, sugerencias) => (
    <div style={{ marginBottom: 14, position: 'relative' }}>
      <label style={labelNeu}>{label}</label>
      <input
        type='text'
        value={form[key]}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        onFocus={() => setFoco(key)}
        onBlur={() => setTimeout(() => setFoco(f => f === key ? null : f), 150)}
        autoComplete='off'
        style={inputNeu}
      />
      {foco === key && sugerencias.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'var(--bg)', borderRadius: 14, marginTop: 6,
          boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)',
          zIndex: 100, overflow: 'hidden',
        }}>
          {sugerencias.map((s, i) => (
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); set(key, s); setFoco(null) }}
              style={{
                padding: '12px 16px', fontSize: 14, cursor: 'pointer',
                color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.03em',
                borderBottom: i < sugerencias.length - 1 ? '1px solid var(--bg-dark)' : 'none',
              }}
            >{s}</div>
          ))}
        </div>
      )}
    </div>
  )

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelNeu}>{label}</label>
      <input type={tipo} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)} style={inputNeu} />
    </div>
  )

  const selectField = (label, key) => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelNeu}>{label}</label>
      <select value={form[key]} onChange={e => set(key, e.target.value)} style={inputNeu}>
        <option value=''>— Sin asignar —</option>
        {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
      </select>
    </div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>Nuevo concierto</h2>
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
        {campoAutocompletar('Artista *', 'artista', 'Ej: Metallica', sugerenciasArtista)}
        {campo('Fecha *', 'fecha', 'date')}
        {campo('Recinto *', 'recinto', 'text', 'Ej: Palau Sant Jordi')}
        {campoAutocompletar('Ciudad *', 'ciudad', 'Ej: Barcelona', sugerenciasCiudad)}
        {campo('Hora apertura', 'hora_apertura', 'time')}
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
          <select value={form.transporte_tipo} onChange={e => set('transporte_tipo', e.target.value)} style={inputNeu}>
            <option value=''>— Sin definir —</option>
            <option value='Coche'>Coche</option>
            <option value='Tren'>Tren</option>
            <option value='AVE'>AVE</option>
            <option value='Avión'>Avión</option>
            <option value='Autobús'>Autobús</option>
          </select>
        </div>
        {selectField('Responsable', 'transporte_responsable')}
      </div>

      <div style={{
        background: 'var(--bg)', borderRadius: 20, padding: 20, marginBottom: 20,
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      }}>
        <div style={seccionTitulo}>Hotel</div>
        {campo('Nombre del hotel', 'hotel_nombre', 'text', 'Ej: NH Madrid Atocha')}
        {selectField('Responsable de la reserva', 'hotel_responsable')}
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        width: '100%', padding: 14, borderRadius: 16,
        background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
        color: 'var(--warm-grey)', border: 'none',
        fontSize: 11, fontWeight: 700, cursor: 'pointer',
        letterSpacing: '0.2em', textTransform: 'uppercase',
        boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
        fontFamily: 'inherit',
      }}>
        {guardando ? 'Guardando...' : 'Guardar concierto'}
      </button>
    </div>
  )
}
