import { useState, useRef } from 'react'
import { BarChart3, Cake } from 'lucide-react'
import { supabase } from '../supabase'
import Avatar from './Avatar'
import FichaAmigo from './FichaAmigo'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const parseFecha = (fecha) => {
  if (!fecha) return { dia: '', mes: '', anio: '' }
  const d = new Date(fecha)
  return { dia: String(d.getUTCDate()), mes: String(d.getUTCMonth() + 1), anio: String(d.getUTCFullYear()) }
}

const buildFecha = (dia, mes, anio) => {
  if (!dia || !mes || !anio || anio.length < 4) return null
  return anio.padStart(4,'0') + '-' + mes.padStart(2,'0') + '-' + dia.padStart(2,'0')
}

const diasParaCumple = (fecha) => {
  if (!fecha) return null
  const hoy = new Date()
  const d = new Date(fecha)
  const esteCumple = new Date(hoy.getFullYear(), d.getUTCMonth(), d.getUTCDate())
  if (esteCumple < hoy) esteCumple.setFullYear(hoy.getFullYear() + 1)
  return Math.ceil((esteCumple - hoy) / (1000 * 60 * 60 * 24))
}

const formatCumple = (fecha) => {
  if (!fecha) return null
  const d = new Date(fecha)
  return d.getUTCDate() + ' de ' + MESES[d.getUTCMonth()]
}

const colores = ['#534AB7','#0F6E56','#993C1D','#185FA5','#993556','#3B6D11','#BA7517','#D85A30','#1D9E75']

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: 'none',
  background: 'var(--bg)',
  boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
  fontSize: 14,
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  outline: 'none',
}

const labelStyle = {
  fontSize: 10,
  color: 'var(--text-secondary)',
  display: 'block',
  marginBottom: 8,
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
}

const sageBtn = {
  background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
  color: 'var(--warm-grey)',
  border: 'none',
  borderRadius: 14,
  padding: '12px 18px',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
  fontFamily: 'inherit',
}

function FormAmigo({ f, setF, onGuardar, onCancelar, titulo, avatar }) {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>{titulo}</h2>
        <button onClick={onCancelar} style={{
          background: 'var(--bg)', border: 'none', borderRadius: '50%',
          width: 36, height: 36, fontSize: 16, color: 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        }}>✕</button>
      </div>

      {avatar}

      <div style={{
        background: 'var(--bg)', borderRadius: 20, padding: 18, marginBottom: 14,
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nombre *</label>
          <input value={f.nombre} onChange={e => setF(x => ({ ...x, nombre: e.target.value }))}
            placeholder='Ej: Bárbara' style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Iniciales *</label>
          <input value={f.iniciales} onChange={e => setF(x => ({ ...x, iniciales: e.target.value.slice(0,2) }))}
            placeholder='Ej: Bá' maxLength={2} style={inputStyle} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Fecha de cumpleaños</label>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 90px', gap: 8 }}>
            <input
              value={f.dia}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g,'')
                if (v === '' || (parseInt(v) >= 1 && parseInt(v) <= 31)) setF(x => ({ ...x, dia: v }))
              }}
              placeholder='Día' inputMode='numeric'
              style={{ ...inputStyle, textAlign: 'center', padding: '11px 6px' }}
            />
            <select value={f.mes} onChange={e => setF(x => ({ ...x, mes: e.target.value }))}
              style={{ ...inputStyle, padding: '11px 10px' }}>
              <option value=''>Mes</option>
              {MESES.map((m,i) => <option key={i} value={String(i+1)}>{m}</option>)}
            </select>
            <input
              value={f.anio}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g,'')
                setF(x => ({ ...x, anio: v.slice(0,4) }))
              }}
              placeholder='Año' inputMode='numeric'
              style={{ ...inputStyle, textAlign: 'center', padding: '11px 6px' }}
            />
          </div>
          {f.dia && f.mes && f.anio && f.anio.length === 4 && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 10, letterSpacing: '0.05em' }}>
              ♪ {f.dia} de {MESES[parseInt(f.mes)-1]} de {f.anio}
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Color del avatar</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {colores.map(c => (
              <div key={c} onClick={() => setF(x => ({ ...x, color: c }))} style={{
                width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer',
                border: f.color === c ? '3px solid var(--warm-grey)' : '3px solid transparent',
                boxShadow: '2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light)',
                transition: 'all 0.15s',
              }} />
            ))}
          </div>
        </div>
      </div>

      <button onClick={onGuardar} style={{ ...sageBtn, width: '100%', padding: 14, borderRadius: 16, fontSize: 12 }}>
        Guardar
      </button>
    </div>
  )
}

export default function Grupo({ amigos, onActualizado, onAbrirEstadisticas }) {
  const [editando, setEditando] = useState(null)
  const [fichaAmigo, setFichaAmigo] = useState(null)
  const [form, setForm] = useState({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
  const [subiendo, setSubiendo] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
  const fileRefs = useRef({})

  const abrirFicha = (amigo) => setFichaAmigo(amigo)

  const abrirEditar = (amigo) => {
    setEditando(amigo)
    setForm({ nombre: amigo.nombre, iniciales: amigo.iniciales, color: amigo.color, ...parseFecha(amigo.fecha_nacimiento) })
  }

  const guardar = async () => {
    if (!form.nombre || !form.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').update({
      nombre: form.nombre, iniciales: form.iniciales, color: form.color,
      fecha_nacimiento: buildFecha(form.dia, form.mes, form.anio),
    }).eq('id', editando.id)
    setEditando(null)
    onActualizado()
  }

  const guardarNuevo = async () => {
    if (!formNuevo.nombre || !formNuevo.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').insert([{
      nombre: formNuevo.nombre, iniciales: formNuevo.iniciales, color: formNuevo.color,
      fecha_nacimiento: buildFecha(formNuevo.dia, formNuevo.mes, formNuevo.anio),
    }])
    setMostrarNuevo(false)
    setFormNuevo({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
    onActualizado()
  }

  const subirFoto = async (amigo, archivo) => {
    if (!archivo) return
    setSubiendo(amigo.id)
    const ext = archivo.name.split('.').pop() || 'jpg'
    const path = amigo.id + '-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('avatares').upload(path, archivo)
    if (!error) {
      const { data } = supabase.storage.from('avatares').getPublicUrl(path)
      await supabase.from('amigos').update({ foto_url: data.publicUrl }).eq('id', amigo.id)
    }
    if (fileRefs.current[amigo.id]) fileRefs.current[amigo.id].value = ''
    setSubiendo(null)
    onActualizado()
  }

  if (fichaAmigo) return (
    <FichaAmigo
      amigo={fichaAmigo}
      amigos={amigos}
      onCerrar={() => setFichaAmigo(null)}
      onEditar={() => { setFichaAmigo(null); abrirEditar(fichaAmigo) }}
    />
  )

  if (mostrarNuevo) return (
    <FormAmigo
      f={formNuevo} setF={setFormNuevo}
      onGuardar={guardarNuevo}
      onCancelar={() => setMostrarNuevo(false)}
      titulo='Nuevo amigo'
      avatar={null}
    />
  )

  if (editando) return (
    <FormAmigo
      f={form} setF={setForm}
      onGuardar={guardar}
      onCancelar={() => setEditando(null)}
      titulo='Editar amigo'
      avatar={
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRefs.current[editando.id]?.click()}>
            <Avatar amigo={{ ...editando, ...form }} size={96} />
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
              border: '3px solid var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              boxShadow: '2px 2px 5px var(--shadow-dark)',
            }}>📷</div>
            <input ref={el => fileRefs.current[editando.id] = el} type='file' accept='image/*'
              style={{ display: 'none' }} onChange={e => subirFoto(editando, e.target.files[0])} />
          </div>
          {subiendo && <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--sage-dark)', marginTop: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Subiendo foto...</div>}
        </div>
      }
    />
  )

  const proximosCumples = amigos
    .filter(a => a.fecha_nacimiento)
    .map(a => ({ ...a, dias: diasParaCumple(a.fecha_nacimiento) }))
    .filter(a => a.dias !== null && a.dias <= 30)
    .sort((a, b) => a.dias - b.dias)

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Grupo · {amigos.length}</div>
        <button onClick={() => setMostrarNuevo(true)} style={{
          background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
          color: 'var(--warm-grey)', border: 'none', borderRadius: 20,
          padding: '7px 16px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
          fontFamily: 'inherit',
        }}>+ Añadir</button>
      </div>

      {/* TARJETA DE ESTADÍSTICAS DEL GRUPO */}
      <div
        onClick={onAbrirEstadisticas}
        className='card-tap'
        style={{
          background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
          borderRadius: 20,
          padding: 16,
          marginBottom: 16,
          color: 'var(--bg-light)',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(60,48,40,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            background: 'rgba(245,239,230,0.12)',
            borderRadius: '50%',
            width: 46,
            height: 46,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0
          }}>
            📊
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sage-light)', letterSpacing: '0.04em' }}>
              Estadísticas del grupo
            </div>
            <div style={{ fontSize: 10, color: 'rgba(245,239,230,0.55)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
              Vuestra historia en números
            </div>
          </div>
        </div>
        <div style={{ fontSize: 24, color: 'rgba(245,239,230,0.6)' }}>›</div>
      </div>

      {proximosCumples.length > 0 && (
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
          borderRadius: 18, padding: 16, marginBottom: 16,
          boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '0.25em', textTransform: 'uppercase' }}>♪ Cumpleaños próximos</div>
          {proximosCumples.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Avatar amigo={a} size={30} />
              <span style={{ fontSize: 13, flex: 1, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.03em' }}>{a.nombre}</span>
              <span style={{ fontSize: 11, color: 'var(--sage-dark)', fontWeight: 700, letterSpacing: '0.05em' }}>
                {a.dias === 0 ? '¡Hoy! 🎉' : a.dias === 1 ? 'Mañana' : 'en ' + a.dias + ' días'}
              </span>
            </div>
          ))}
        </div>
      )}

      {amigos.map(a => {
        const dias = diasParaCumple(a.fecha_nacimiento)
        const cumpleProximo = dias !== null && dias <= 30
        return (
          <div key={a.id} onClick={() => abrirFicha(a)} className='fade-in-up card-tap' style={{
            background: 'var(--bg)', borderRadius: 18, padding: '14px 16px',
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
            boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
          }}>
            <div style={{ flexShrink: 0 }}>
              <Avatar amigo={a} size={53} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{a.nombre}</div>
              {a.fecha_nacimiento && (
                <div style={{ fontSize: 11, color: cumpleProximo ? 'var(--sage-dark)' : 'var(--text-secondary)', marginTop: 4, letterSpacing: '0.03em' }}>
                  ♪ {formatCumple(a.fecha_nacimiento)}
                  {cumpleProximo && <span style={{ fontWeight: 700 }}> · {dias === 0 ? '¡Hoy!' : dias === 1 ? 'mañana' : 'en ' + dias + ' días'}</span>}
                </div>
              )}
              {subiendo === a.id && <div style={{ fontSize: 10, color: 'var(--sage-dark)', marginTop: 4, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Subiendo foto...</div>}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: 20 }}>›</span>
          </div>
        )
      })}
    </div>
  )
}
