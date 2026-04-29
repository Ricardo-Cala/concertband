import { readFileSync, writeFileSync } from 'fs'

// =========================================================
// 1) REESCRITURA COMPLETA DE NuevoConcierto.jsx
// =========================================================
const nuevoConciertoCode = `import { useState, useMemo } from 'react'
import { supabase } from '../supabase'

const normalizar = (txt) => (txt || '')
  .toString()
  .normalize('NFD')
  .replace(/[\\u0300-\\u036f]/g, '')
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

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, background: 'white',
    boxSizing: 'border-box'
  }

  const campoAutocompletar = (label, key, placeholder, sugerencias) => (
    <div style={{ marginBottom: 12, position: 'relative' }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input
        type='text'
        value={form[key]}
        placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        onFocus={() => setFoco(key)}
        onBlur={() => setTimeout(() => setFoco(f => f === key ? null : f), 150)}
        autoComplete='off'
        style={inputStyle}
      />
      {foco === key && sugerencias.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: 8,
          marginTop: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {sugerencias.map((s, i) => (
            <div
              key={s}
              onMouseDown={(e) => { e.preventDefault(); set(key, s); setFoco(null) }}
              style={{
                padding: '10px 12px',
                fontSize: 14,
                cursor: 'pointer',
                borderBottom: i < sugerencias.length - 1 ? '1px solid #f0f0f5' : 'none',
                background: 'white'
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={tipo} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={inputStyle} />
    </div>
  )

  const select = (label, key) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <select value={form[key]} onChange={e => set(key, e.target.value)}
        style={inputStyle}>
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
        {campoAutocompletar('Artista *', 'artista', 'Ej: Metallica', sugerenciasArtista)}
        {campo('Fecha *', 'fecha', 'date')}
        {campo('Recinto *', 'recinto', 'text', 'Ej: Palau Sant Jordi')}
        {campoAutocompletar('Ciudad *', 'ciudad', 'Ej: Barcelona', sugerenciasCiudad)}
        {campo('Hora apertura', 'hora_apertura', 'time')}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Estado</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)}
            style={inputStyle}>
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
            style={inputStyle}>
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
`

writeFileSync('src/components/NuevoConcierto.jsx', nuevoConciertoCode)
console.log('✅ NuevoConcierto.jsx reescrito con autocompletado')

// =========================================================
// 2) PARCHE A App.jsx: pasar conciertos al formulario
// =========================================================
let appCode = readFileSync('src/App.jsx', 'utf8')

const viejoApp = `      <NuevoConcierto
        amigos={amigos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />`

const nuevoApp = `      <NuevoConcierto
        amigos={amigos}
        conciertos={conciertos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />`

if (appCode.includes(viejoApp)) {
  appCode = appCode.replace(viejoApp, nuevoApp)
  writeFileSync('src/App.jsx', appCode)
  console.log('✅ App.jsx actualizado: pasa conciertos al formulario')
} else if (appCode.includes('conciertos={conciertos}')) {
  console.log('ℹ️ App.jsx ya pasaba conciertos, no hay nada que cambiar')
} else {
  console.log('⚠️ No se encontró el bloque exacto en App.jsx — revísalo manualmente')
}

console.log('\n🎸 Hecho. Recarga localhost:5173 y prueba.')