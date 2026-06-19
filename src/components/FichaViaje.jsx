import { useState, useEffect } from 'react'
import { Plane, Car, Bus, TrainFront, FileText, RefreshCw, Paperclip, MapPin } from 'lucide-react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function FichaViaje({ tipo, datos, amigos, conciertoId, onCerrar, onActualizado }) {
  const [editando, setEditando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [form, setForm] = useState({})
  const esTransporte = tipo === 'transporte'
  const tipoNombre = () => {
    const t = datos?.tipo || ''
    if (t === 'Avión') return { ida: 'VUELO DE IDA', vuelta: 'VUELO DE VUELTA', numero: 'N° vuelo', numeroVuelta: 'N° vuelo vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
    if (t === 'Tren' || t === 'AVE') return { ida: 'TREN DE IDA', vuelta: 'TREN DE VUELTA', numero: 'N° tren', numeroVuelta: 'N° tren vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
    if (t === 'Autobús') return { ida: 'AUTOBÚS DE IDA', vuelta: 'AUTOBÚS DE VUELTA', numero: 'N° autobús', numeroVuelta: 'N° autobús vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
    return { ida: 'IDA', vuelta: 'VUELTA', numero: 'N° servicio', numeroVuelta: 'N° servicio vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
  }
  const tn = tipoNombre()

  useEffect(() => { setForm(datos || {}) }, [datos])

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
      await supabase.from('transportes').update({ billete_url: data.publicUrl }).eq('id', datos.id)
      set('billete_url', data.publicUrl)
      onActualizado()
    }
    setSubiendo(false)
  }

  const noches = () => {
    if (!form.fecha_entrada || !form.fecha_salida) return 0
    return Math.ceil((new Date(form.fecha_salida) - new Date(form.fecha_entrada)) / (1000 * 60 * 60 * 24))
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
  const secTitulo = {
    fontSize: 10, fontWeight: 700, color: 'var(--sage-dark)',
    marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
  }
  const sageBtn = {
    width: '100%', padding: 14, borderRadius: 16, border: 'none',
    background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
    color: 'var(--warm-grey)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
    letterSpacing: '0.2em', textTransform: 'uppercase',
    boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
    fontFamily: 'inherit',
  }

  const campo = (label, key, tipo = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelNeu}>{label}</label>
      <input type={tipo} value={form[key] || ''} placeholder={placeholder}
        onChange={e => set(key, e.target.value)} style={inputNeu} />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(60,48,40,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 16, backdropFilter: 'blur(4px)',
    }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg)', borderRadius: 22,
        width: '100%', maxWidth: 390, maxHeight: '85vh',
        overflowY: 'auto', padding: 22,
        boxShadow: '12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
            {esTransporte ? iconTransporte(datos?.tipo) + ' ' + (datos?.tipo || 'Transporte') : '🏨 Hotel'}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setEditando(!editando)} style={{
              background: editando ? 'linear-gradient(145deg, var(--sage-light), var(--sage))' : 'var(--bg)',
              border: 'none', borderRadius: 20,
              padding: '5px 14px', fontSize: 10, fontWeight: 700,
              color: editando ? 'var(--warm-grey)' : 'var(--text-secondary)',
              cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase',
              boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
              fontFamily: 'inherit',
            }}>{editando ? '✕ Cancelar' : '✏️ Editar'}</button>
            <button onClick={onCerrar} style={{
              background: 'var(--bg)', border: 'none', borderRadius: '50%',
              width: 34, height: 34, fontSize: 15, color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
            }}>✕</button>
          </div>
        </div>

        {!editando && esTransporte && datos?.tipo === 'Coche' && (
          <div>
            {(form.coches || []).length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, padding: 18, letterSpacing: '0.05em' }}>Sin coches añadidos todavía</div>
            )}
            {(form.coches || []).map((cocheId, i) => {
              const conductor = amigos.find(a => a.id === cocheId)
              return conductor ? (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '0.5px solid var(--bg-dark)' }}>
                  <Avatar amigo={conductor} size={40} />
                  <div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Coche {i + 1}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{conductor.nombre}</div>
                  </div>
                </div>
              ) : null
            })}
          </div>
        )}

        {!editando && esTransporte && datos?.tipo !== 'Coche' && (
          <div>
            <div style={secTitulo}>{tn.ida}</div>
            {form.compania && <InfoRow label={tn.compania} value={form.compania} />}
            {form.numero_vuelo && <InfoRow label={tn.numero} value={form.numero_vuelo} />}
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
              <div style={{ ...secTitulo, marginTop: 14 }}>{tn.vuelta}</div>
            )}
            {form.compania_vuelta && <InfoRow label={tn.companiaVuelta} value={form.compania_vuelta} />}
            {form.numero_vuelo_vuelta && <InfoRow label={tn.numeroVuelta} value={form.numero_vuelo_vuelta} />}
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
              return comprador ? <InfoRow label='Compró billetes' value={comprador.nombre} /> : null
            })()}

            {(form.viajeros || []).length > 0 && (
              <div style={{ marginTop: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Viajan</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(form.viajeros || []).map(id => {
                    const a = amigos.find(x => x.id === id)
                    return a ? (
                      <div key={id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                        borderRadius: 20, padding: '5px 12px',
                        boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
                      }}>
                        <Avatar amigo={a} size={24} />
                        <span style={{ fontSize: 11, color: 'var(--warm-grey)', fontWeight: 700, letterSpacing: '0.03em' }}>{a.nombre}</span>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              {form.billete_url ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => window.open(form.billete_url, '_blank')} style={{
                    flex: 1, padding: 12, borderRadius: 14, border: 'none',
                    background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                    color: 'var(--warm-grey)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    letterSpacing: '0.1em', fontFamily: 'inherit',
                    boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                  }}><FileText size={14} style={{marginRight:4}} />Ver billetes</button>
                  <label style={{
                    padding: '12px 16px', borderRadius: 14, border: 'none',
                    background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                    boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                  }}>
                    🔄
                    <input type='file' accept='application/pdf,image/*' style={{ display: 'none' }}
                      onChange={e => subirBillete(e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <label style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: 14, borderRadius: 16,
                  background: 'var(--bg)', border: 'none',
                  color: 'var(--sage-dark)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  boxSizing: 'border-box', letterSpacing: '0.15em', textTransform: 'uppercase',
                  boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
                  fontFamily: 'inherit',
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
                width: '100%', padding: 12, borderRadius: 14, border: 'none', marginTop: 14,
                background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                color: 'var(--warm-grey)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.1em', fontFamily: 'inherit',
                boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
              }}><MapPin size={14} style={{marginRight:4}} />Ver en Google Maps</button>
            )}
          </div>
        )}

        {editando && esTransporte && datos?.tipo === 'Coche' && (
          <div>
            <div style={labelNeu}>¿Quién pone el coche?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {amigos.map(a => {
                const coches = form.coches || []
                const sel = coches.includes(a.id)
                return (
                  <div key={a.id} onClick={() => {
                    set('coches', sel ? coches.filter(id => id !== a.id) : [...coches, a.id])
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                    background: sel ? 'linear-gradient(145deg, var(--sage-light), var(--sage))' : 'var(--bg)',
                    boxShadow: sel
                      ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)'
                      : 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                  }}>
                    <Avatar amigo={a} size={36} />
                    <span style={{ fontSize: 13, flex: 1, fontWeight: 700, color: sel ? 'var(--warm-grey)' : 'var(--text-secondary)', letterSpacing: '0.03em' }}>{a.nombre}</span>
                    <span style={{ fontSize: 16, color: sel ? 'var(--warm-grey)' : 'var(--text-secondary)', opacity: sel ? 1 : 0.3 }}>{sel ? <Car size={16} /> : '○'}</span>
                  </div>
                )
              })}
            </div>
            <button onClick={guardar} style={sageBtn}>Guardar</button>
          </div>
        )}

        {editando && esTransporte && datos?.tipo !== 'Coche' && (
          <div>
            <div style={secTitulo}>{tn.ida}</div>
            {campo(tn.compania, 'compania', 'text', 'Ej: Iberia, Renfe...')}
            {campo(tn.numero, 'numero_vuelo', 'text', 'Ej: IB3456')}
            <div style={{ marginBottom: 14 }}>
              <label style={labelNeu}>¿Quién compró los billetes?</label>
              <select value={form.comprador_id || form.responsable_id || ''} onChange={e => set('responsable_id', e.target.value)} style={inputNeu}>
                <option value=''>— Sin asignar —</option>
                {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            {campo('Fecha de salida', 'fecha_salida', 'date')}
            {campo('Hora de salida', 'hora_salida', 'time')}
            {campo('Fecha de llegada', 'fecha_llegada', 'date')}
            {campo('Hora de llegada', 'hora_llegada', 'time')}
            <div style={{ ...secTitulo, marginTop: 18 }}>{tn.vuelta}</div>
            {campo(tn.companiaVuelta, 'compania_vuelta', 'text', 'Ej: Iberia, Ryanair...')}
            {campo(tn.numeroVuelta, 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}
            {campo('Fecha salida vuelta', 'fecha_salida_vuelta', 'date')}
            {campo('Hora salida vuelta', 'hora_salida_vuelta', 'time')}
            {campo('Fecha llegada vuelta', 'fecha_llegada_vuelta', 'date')}
            {campo('Hora llegada vuelta', 'hora_llegada_vuelta', 'time')}
            <div style={{ marginBottom: 18 }}>
              <label style={labelNeu}>¿Quién viaja?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {amigos.map(a => {
                  const sel = (form.viajeros || []).includes(a.id)
                  return (
                    <div key={a.id} onClick={() => toggleViajero(a.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 14, cursor: 'pointer',
                      background: sel ? 'linear-gradient(145deg, var(--sage-light), var(--sage))' : 'var(--bg)',
                      boxShadow: sel
                        ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)'
                        : 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                    }}>
                      <Avatar amigo={a} size={36} />
                      <span style={{ fontSize: 13, flex: 1, fontWeight: 700, color: sel ? 'var(--warm-grey)' : 'var(--text-secondary)', letterSpacing: '0.03em' }}>{a.nombre}</span>
                      <span style={{ fontSize: 16, color: sel ? 'var(--warm-grey)' : 'var(--text-secondary)', opacity: sel ? 1 : 0.3 }}>{sel ? '✓' : '○'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <button onClick={guardar} style={sageBtn}>Guardar</button>
          </div>
        )}

        {editando && !esTransporte && (
          <div>
            {campo('Nombre del hotel', 'nombre', 'text', 'Ej: NH Milano')}
            <div style={{ marginBottom: 14 }}>
              <label style={labelNeu}>¿Quién hizo la reserva?</label>
              <select value={form.responsable_id || ''} onChange={e => set('responsable_id', e.target.value)} style={inputNeu}>
                <option value=''>— Sin asignar —</option>
                {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            {campo('Fecha de entrada', 'fecha_entrada', 'date')}
            {campo('Fecha de salida', 'fecha_salida', 'date')}
            {campo('Enlace Google Maps', 'maps_url', 'text', 'https://maps.google.com/...')}
            <button onClick={guardar} style={sageBtn}>Guardar</button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '0.5px solid var(--bg-dark)' }}>
      <span style={{ fontSize: 10, color: 'var(--text-secondary)', flexShrink: 0, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', maxWidth: '65%', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{value}</span>
    </div>
  )
}
