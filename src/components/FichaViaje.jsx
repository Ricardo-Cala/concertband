import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function FichaViaje({ tipo, datos, amigos, onCerrar, onActualizado }) {
  const [editando, setEditando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [form, setForm] = useState({})
  const esTransporte = tipo === 'transporte'

  useEffect(() => {
    setForm(datos || {})
  }, [datos])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleViajero = (amigoId) => {
    const viajeros = form.viajeros || []
    set('viajeros', viajeros.includes(amigoId)
      ? viajeros.filter(id => id !== amigoId)
      : [...viajeros, amigoId]
    )
  }

  const guardar = async () => {
    const tabla = esTransporte ? 'transportes' : 'hoteles'
    const camposLimpios = { ...form }
    delete camposLimpios.amigos
    delete camposLimpios.id
    delete camposLimpios.concierto_id
    delete camposLimpios.created_at
    const { error } = await supabase.from(tabla).update(camposLimpios).eq('id', datos.id)
    if (error) {
      console.error('Error guardando:', error)
      alert('Error al guardar: ' + error.message)
    } else {
      setEditando(false)
      onActualizado()
    }
  }

  const subirBillete = async (archivo) => {
    if (!archivo) return
    setSubiendo(true)
    const ext = archivo.type.includes('pdf') ? 'pdf' : archivo.name.split('.').pop() || 'jpg'
    const path = datos.id + '-billete-' + Date.now() + '.' + ext
    const { error: uploadError } = await supabase.storage.from('billetes').upload(path, archivo, { upsert: true })
    if (!uploadError) {
      const { data } = supabase.storage.from('billetes').getPublicUrl(path)
      const url = data.publicUrl
      await supabase.from('transportes').update({ billete_url: url }).eq('id', datos.id)
      set('billete_url', url)
      onActualizado()
    }
    setSubiendo(false)
  }

  const noches = () => {
    if (!form.fecha_entrada || !form.fecha_salida) return 0
    const diff = new Date(form.fecha_salida) - new Date(form.fecha_entrada)
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const iconTransporte = (t) => {
    if (t === 'Avión') return '✈️'
    if (t === 'Coche') return '🚗'
    if (t === 'Autobús') return '🚌'
    if (t === 'AVE') return '🚄'
    return '🚆'
  }

  const formatFecha = (f) => {
    if (!f) return null
    return new Date(f).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type={tipo} value={form[key] || ''} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white', boxSizing: 'border-box' }} />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 16
    }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', borderRadius: 16,
        width: '100%', maxWidth: 390, maxHeight: '85vh',
        overflowY: 'auto', padding: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {esTransporte ? `${iconTransporte(datos?.tipo)} ${datos?.tipo || 'Transporte'}` : '🏨 Hotel'}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setEditando(!editando)} style={{
              background: editando ? '#EEEDFE' : 'none',
              border: '1px solid #eee', borderRadius: 20,
              padding: '4px 12px', fontSize: 12,
              color: editando ? '#3C3489' : '#888', cursor: 'pointer'
            }}>{editando ? '✕ Cancelar' : '✏️ Editar'}</button>
            <button onClick={onCerrar} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {!editando && esTransporte && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>VUELO DE IDA</div>
            {form.compania && <InfoRow label='Compañía' value={form.compania} />}
            {form.numero_vuelo && <InfoRow label='N° vuelo/tren' value={form.numero_vuelo} />}
            {form.fecha_salida && (
              <InfoRow label='Salida' value={
                formatFecha(form.fecha_salida) + (form.hora_salida ? ' · ' + form.hora_salida.slice(0,5) + 'h' : '')
              } />
            )}
            {form.fecha_llegada && (
              <InfoRow label='Llegada' value={
                formatFecha(form.fecha_llegada) + (form.hora_llegada ? ' · ' + form.hora_llegada.slice(0,5) + 'h' : '')
              } />
            )}
            {(form.numero_vuelo_vuelta || form.fecha_salida_vuelta || form.compania_vuelta) && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 11, fontWeight: 500, color: '#7F77DD' }}>VUELO DE VUELTA</div>
            )}
            {form.compania_vuelta && <InfoRow label='Compañía' value={form.compania_vuelta} />}
            {form.numero_vuelo_vuelta && <InfoRow label='N° vuelo' value={form.numero_vuelo_vuelta} />}
            {form.fecha_salida_vuelta && (
              <InfoRow label='Salida vuelta' value={
                formatFecha(form.fecha_salida_vuelta) + (form.hora_salida_vuelta ? ' · ' + form.hora_salida_vuelta.slice(0,5) + 'h' : '')
              } />
            )}
            {form.fecha_llegada_vuelta && (
              <InfoRow label='Llegada vuelta' value={
                formatFecha(form.fecha_llegada_vuelta) + (form.hora_llegada_vuelta ? ' · ' + form.hora_llegada_vuelta.slice(0,5) + 'h' : '')
              } />
            )}
            {form.comprador_id && (() => {
              const comprador = amigos.find(a => a.id === form.comprador_id || a.id === form.responsable_id)
              return comprador ? <InfoRow label='Compró los billetes' value={comprador.nombre} /> : null
            })()}

            {(form.viajeros || []).length > 0 && (
              <div style={{ marginTop: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>VIAJAN</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(form.viajeros || []).map(id => {
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

            <div style={{ marginTop: 14 }}>
              {form.billete_url ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => window.open(form.billete_url, '_blank')} style={{
                    flex: 1, padding: 10, borderRadius: 10, border: 'none',
                    background: '#EEEDFE', color: '#3C3489', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                  }}>📄 Ver billetes</button>
                  <label style={{
                    padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd',
                    background: 'white', color: '#888', fontSize: 13, cursor: 'pointer'
                  }}>
                    🔄
                    <input type='file' accept='application/pdf,image/*' style={{ display: 'none' }}
                      onChange={e => subirBillete(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: 12, borderRadius: 10,
                  border: '1px dashed #7F77DD', background: 'white',
                  color: '#7F77DD', fontSize: 13, fontWeight: 500, cursor: 'pointer', boxSizing: 'border-box'
                }}>
                  {subiendo ? 'Subiendo...' : '📎 Subir billetes'}
                  <input type='file' accept='application/pdf,image/*' style={{ display: 'none' }}
                    onChange={e => subirBillete(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
        )}

        {!editando && !esTransporte && (
          <div>
            {form.nombre && <InfoRow label='Hotel' value={form.nombre} />}
            {datos?.amigos && <InfoRow label='Reserva' value={datos.amigos.nombre} />}
            {form.fecha_entrada && <InfoRow label='Entrada' value={formatFecha(form.fecha_entrada)} />}
            {form.fecha_salida && <InfoRow label='Salida' value={formatFecha(form.fecha_salida)} />}
            {form.fecha_entrada && form.fecha_salida && noches() > 0 && (
              <InfoRow label='Noches' value={noches() + ' noche' + (noches() > 1 ? 's' : '')} />
            )}
            {form.maps_url && (
              <button onClick={() => window.open(form.maps_url, '_blank')} style={{
                width: '100%', padding: 10, borderRadius: 10, border: 'none', marginTop: 12,
                background: '#E6F1FB', color: '#0C447C', fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>📍 Ver en Google Maps</button>
            )}
          </div>
        )}

        {editando && esTransporte && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>VUELO DE IDA</div>
            {campo('Compañía', 'compania', 'text', 'Ej: Iberia, Renfe...')}
            {campo('N° vuelo/tren', 'numero_vuelo', 'text', 'Ej: IB3456')}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>¿Quién compró los billetes?</label>
              <select value={form.comprador_id || form.responsable_id || ''} onChange={e => set('responsable_id', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
                <option value=''>— Sin asignar —</option>
                {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            {campo('Fecha de salida', 'fecha_salida', 'date')}
            {campo('Hora de salida', 'hora_salida', 'time')}
            {campo('Fecha de llegada', 'fecha_llegada', 'date')}
            {campo('Hora de llegada', 'hora_llegada', 'time')}
            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', margin: '16px 0 8px' }}>VUELO DE VUELTA</div>
            {campo('Compañía vuelta', 'compania_vuelta', 'text', 'Ej: Iberia, Ryanair...')}
            {campo('N° vuelo vuelta', 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}
            {campo('Fecha de salida vuelta', 'fecha_salida_vuelta', 'date')}
            {campo('Hora de salida vuelta', 'hora_salida_vuelta', 'time')}
            {campo('Fecha de llegada vuelta', 'fecha_llegada_vuelta', 'date')}
            {campo('Hora de llegada vuelta', 'hora_llegada_vuelta', 'time')}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>¿Quién viaja?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {amigos.map(a => {
                  const sel = (form.viajeros || []).includes(a.id)
                  return (
                    <div key={a.id} onClick={() => toggleViajero(a.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                      background: sel ? '#EEEDFE' : '#f8f8f8',
                      border: sel ? '1px solid #AFA9EC' : '1px solid #eee',
                    }}>
                      <Avatar amigo={a} size={28} />
                      <span style={{ fontSize: 13, flex: 1, fontWeight: sel ? 500 : 400, color: sel ? '#3C3489' : 'inherit' }}>{a.nombre}</span>
                      <span style={{ fontSize: 16, color: sel ? '#7F77DD' : '#ddd' }}>{sel ? '✓' : '○'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <button onClick={guardar} style={{
              width: '100%', padding: 12, borderRadius: 10, border: 'none',
              background: '#7F77DD', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>Guardar</button>
          </div>
        )}

        {editando && !esTransporte && (
          <div>
            {campo('Nombre del hotel', 'nombre', 'text', 'Ej: NH Milano')}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>¿Quién hizo la reserva?</label>
              <select value={form.responsable_id || ''} onChange={e => set('responsable_id', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white' }}>
                <option value=''>— Sin asignar —</option>
                {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            {campo('Fecha de entrada', 'fecha_entrada', 'date')}
            {campo('Fecha de salida', 'fecha_salida', 'date')}
            {campo('Enlace Google Maps', 'maps_url', 'text', 'https://maps.google.com/...')}
            <button onClick={guardar} style={{
              width: '100%', padding: 12, borderRadius: 10, border: 'none',
              background: '#7F77DD', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>Guardar</button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '0.5px solid #f0f0f0' }}>
      <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  )
}