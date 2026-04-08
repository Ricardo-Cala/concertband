import { useState } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function FichaViaje({ tipo, datos, amigos, conciertoId, onCerrar, onActualizado }) {
  const [editando, setEditando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [form, setForm] = useState(datos || {})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const esTransporte = tipo === 'transporte'

  const toggleViajero = (amigoId) => {
    const viajeros = form.viajeros || []
    set('viajeros', viajeros.includes(amigoId)
      ? viajeros.filter(id => id !== amigoId)
      : [...viajeros, amigoId]
    )
  }

  const guardar = async () => {
    const tabla = esTransporte ? 'transportes' : 'hoteles'
    await supabase.from(tabla).update(form).eq('id', datos.id)
    setEditando(false)
    onActualizado()
  }

  const subirBillete = async (archivo) => {
    if (!archivo) return
    setSubiendo(true)
    const ext = archivo.type.includes('pdf') ? 'pdf' : archivo.name.split('.').pop() || 'jpg'
    const path = datos.id + '-billete.' + ext
    await supabase.storage.from('billetes').upload(path, archivo, { upsert: true })
    const { data } = supabase.storage.from('billetes').getPublicUrl(path)
    const url = data.publicUrl + '?t=' + Date.now()
    await supabase.from('transportes').update({ billete_url: url }).eq('id', datos.id)
    set('billete_url', url)
    setSubiendo(false)
    onActualizado()
  }

  const noches = () => {
    if (!form.fecha_entrada || !form.fecha_salida) return 0
    const diff = new Date(form.fecha_salida) - new Date(form.fecha_entrada)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const iconTransporte = (tipo) => {
    if (tipo === 'Avión') return '✈️'
    if (tipo === 'Coche') return '🚗'
    if (tipo === 'Autobús') return '🚌'
    if (tipo === 'AVE') return '🚄'
    return '🚆'
  }

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={tipo} value={form[key] || ''} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }} />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200
    }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: '16px 16px 0 0',
        width: '100%', maxWidth: 390, maxHeight: '85vh',
        overflowY: 'auto', padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {esTransporte ? `${iconTransporte(datos?.tipo)} ${datos?.tipo || 'Transporte'}` : '🏨 Hotel'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editando && (
              <button onClick={() => setEditando(true)} style={{
                background: 'none', border: '1px solid #eee', borderRadius: 20,
                padding: '4px 12px', fontSize: 12, color: '#888', cursor: 'pointer'
              }}>✏️ Editar</button>
            )}
            <button onClick={onCerrar} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {esTransporte && !editando && (
          <div>
            {datos.compania && <InfoRow label='Compañía' value={datos.compania} />}
            {datos.numero_vuelo && <InfoRow label='Número' value={datos.numero_vuelo} />}
            {datos.fecha_salida && <InfoRow label='Salida' value={
              new Date(datos.fecha_salida).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) +
              (datos.hora_salida ? ' · ' + datos.hora_salida.slice(0,5) : '')
            } />}
            {datos.fecha_llegada && <InfoRow label='Llegada' value={
              new Date(datos.fecha_llegada).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) +
              (datos.hora_llegada ? ' · ' + datos.hora_llegada.slice(0,5) : '')
            } />}

            {datos.viajeros?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>VIAJAN</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {datos.viajeros.map(id => {
                    const a = amigos.find(x => x.id === id)
                    return a ? (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EEEDFE', borderRadius: 20, padding: '4px 10px' }}>
                        <Avatar amigo={a} size={20} />
                        <span style={{ fontSize: 12, color: '#3C3489' }}>{a.nombre}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {datos.billete_url ? (
                <button onClick={() => window.open(datos.billete_url, '_blank')} style={{
                  flex: 1, padding: 10, borderRadius: 10, border: 'none',
                  background: '#EEEDFE', color: '#3C3489', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>📄 Ver billetes</button>
              ) : (
                <label style={{
                  flex: 1, padding: 10, borderRadius: 10, border: '1px dashed #ddd',
                  background: 'white', color: '#888', fontSize: 13, cursor: 'pointer',
                  textAlign: 'center', display: 'block'
                }}>
                  📎 Subir billetes
                  <input type='file' accept='application/pdf,image/*' style={{ display: 'none' }}
                    onChange={e => subirBillete(e.target.files[0])} />
                </label>
              )}
            </div>
            {subiendo && <div style={{ fontSize: 12, color: '#7F77DD', textAlign: 'center', marginTop: 8 }}>Subiendo...</div>}
          </div>
        )}

        {!esTransporte && !editando && (
          <div>
            {datos.nombre && <InfoRow label='Hotel' value={datos.nombre} />}
            {datos.amigos && <InfoRow label='Reserva' value={datos.amigos.nombre} />}
            {datos.fecha_entrada && <InfoRow label='Entrada' value={new Date(datos.fecha_entrada).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} />}
            {datos.fecha_salida && <InfoRow label='Salida' value={new Date(datos.fecha_salida).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} />}
            {datos.fecha_entrada && datos.fecha_salida && (
              <InfoRow label='Noches' value={noches() + ' noche' + (noches() > 1 ? 's' : '')} />
            )}
            {datos.precio_noche && (
              <InfoRow label='Precio' value={datos.precio_noche + '€/noche · ' + (datos.precio_noche * noches()).toFixed(0) + '€ total'} />
            )}
            {datos.maps_url && (
              <button onClick={() => window.open(datos.maps_url, '_blank')} style={{
                width: '100%', padding: 10, borderRadius: 10, border: 'none', marginTop: 8,
                background: '#E6F1FB', color: '#0C447C', fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>📍 Ver en Google Maps</button>
            )}
          </div>
        )}

        {editando && esTransporte && (
          <div>
            {campo('Compañía', 'compania', 'text', 'Ej: Iberia, Renfe...')}
            {campo('Número de vuelo/tren', 'numero_vuelo', 'text', 'Ej: IB3456')}
            {campo('Fecha de salida', 'fecha_salida', 'date')}
            {campo('Hora de salida', 'hora_salida', 'time')}
            {campo('Fecha de llegada', 'fecha_llegada', 'date')}
            {campo('Hora de llegada', 'hora_llegada', 'time')}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>¿Quién viaja?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {amigos.map(a => {
                  const seleccionado = (form.viajeros || []).includes(a.id)
                  return (
                    <div key={a.id} onClick={() => toggleViajero(a.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                      background: seleccionado ? '#EEEDFE' : '#f8f8f8',
                      border: seleccionado ? '1px solid #AFA9EC' : '1px solid #eee',
                    }}>
                      <Avatar amigo={a} size={28} />
                      <span style={{ fontSize: 13, flex: 1, fontWeight: seleccionado ? 500 : 400, color: seleccionado ? '#3C3489' : 'inherit' }}>{a.nombre}</span>
                      <span style={{ fontSize: 16, color: seleccionado ? '#7F77DD' : '#ddd' }}>{seleccionado ? '✓' : '○'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditando(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>
        )}

        {editando && !esTransporte && (
          <div>
            {campo('Nombre del hotel', 'nombre', 'text', 'Ej: NH Milano')}
            {campo('Fecha de entrada', 'fecha_entrada', 'date')}
            {campo('Fecha de salida', 'fecha_salida', 'date')}
            {campo('Precio por noche (€)', 'precio_noche', 'number', 'Ej: 120')}
            {campo('Enlace Google Maps', 'maps_url', 'text', 'https://maps.google.com/...')}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditando(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Guardar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid #f0f0f0' }}>
      <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  )
}