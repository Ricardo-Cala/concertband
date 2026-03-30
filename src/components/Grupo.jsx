import { useState, useRef } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function Grupo({ amigos, onActualizado }) {
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
  const [subiendo, setSubiendo] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
  const fileRefs = useRef({})

  const colores = [
    '#534AB7', '#0F6E56', '#993C1D', '#185FA5',
    '#993556', '#3B6D11', '#BA7517', '#D85A30', '#1D9E75'
  ]

  const diasParaCumple = (fecha) => {
    if (!fecha) return null
    const hoy = new Date()
    const cumple = new Date(fecha)
    const esteCumple = new Date(hoy.getFullYear(), cumple.getMonth(), cumple.getDate())
    if (esteCumple < hoy) esteCumple.setFullYear(hoy.getFullYear() + 1)
    const dias = Math.ceil((esteCumple - hoy) / (1000 * 60 * 60 * 24))
    return dias
  }

  const formatCumple = (fecha) => {
    if (!fecha) return null
    const d = new Date(fecha)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })
  }

  const parseFecha = (fecha) => {
    if (!fecha) return { dia: '', mes: '', anio: '' }
    const d = new Date(fecha)
    return { dia: String(d.getUTCDate()), mes: String(d.getUTCMonth() + 1), anio: String(d.getUTCFullYear()) }
  }

  const buildFecha = (dia, mes, anio) => {
    if (!dia || !mes || !anio || anio.length < 4) return null
    return `${anio.padStart(4,'0')}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`
  }

  const abrirEditar = (amigo) => {
    setEditando(amigo)
    const { dia, mes, anio } = parseFecha(amigo.fecha_nacimiento)
    setForm({ nombre: amigo.nombre, iniciales: amigo.iniciales, color: amigo.color, dia, mes, anio })
  }

  const guardar = async () => {
    if (!form.nombre || !form.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').update({
      nombre: form.nombre,
      iniciales: form.iniciales,
      color: form.color,
      fecha_nacimiento: buildFecha(form.dia, form.mes, form.anio),
    }).eq('id', editando.id)
    setEditando(null)
    onActualizado()
  }

  const guardarNuevo = async () => {
    if (!formNuevo.nombre || !formNuevo.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').insert([{
      nombre: formNuevo.nombre,
      iniciales: formNuevo.iniciales,
      color: formNuevo.color,
      fecha_nacimiento: buildFecha(formNuevo.dia, formNuevo.mes, formNuevo.anio),
    }])
    setMostrarNuevo(false)
    setFormNuevo({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
    onActualizado()
  }

  const subirFoto = async (amigo, archivo) => {
    if (!archivo) return
    setSubiendo(amigo.id)
    const ext = archivo.name.split('.').pop()
    const path = amigo.id + '.' + ext
    await supabase.storage.from('avatares').upload(path, archivo, { upsert: true })
    const { data } = supabase.storage.from('avatares').getPublicUrl(path)
    await supabase.from('amigos').update({ foto_url: data.publicUrl + '?t=' + Date.now() }).eq('id', amigo.id)
    setSubiendo(null)
    onActualizado()
  }

  const FormAmigo = ({ f, setF, onGuardar, onCancelar, titulo }) => (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>{titulo}</h2>
        <button onClick={onCancelar} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Nombre *</label>
          <input value={f.nombre} onChange={e => setF(x => ({ ...x, nombre: e.target.value }))} placeholder='Ej: Bárbara'
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Iniciales *</label>
          <input value={f.iniciales} onChange={e => setF(x => ({ ...x, iniciales: e.target.value.slice(0, 2) }))} placeholder='Ej: Bá' maxLength={2}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>Fecha de cumpleaños</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: 6 }}>
            <input type='number' value={f.dia} onChange={e => setF(x => ({ ...x, dia: e.target.value }))}
              placeholder='Día' min='1' max='31'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />
            <select value={f.mes} onChange={e => setF(x => ({ ...x, mes: e.target.value }))}
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, background: 'white' }}>
              <option value=''>Mes</option>
              <option value='1'>Enero</option><option value='2'>Febrero</option><option value='3'>Marzo</option><option value='4'>Abril</option><option value='5'>Mayo</option><option value='6'>Junio</option><option value='7'>Julio</option><option value='8'>Agosto</option><option value='9'>Septiembre</option><option value='10'>Octubre</option><option value='11'>Noviembre</option><option value='12'>Diciembre</option>
            </select>
            <input
              type='text'
              value={f.anio}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g, '')
                if (v.length <= 4) setF(x => ({ ...x, anio: v }))
              }}
              placeholder='Año'
              inputMode='numeric'
              maxLength={4}
              autoComplete='off'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>Color del avatar</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colores.map(c => (
              <div key={c} onClick={() => setF(x => ({ ...x, color: c }))} style={{
                width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                border: f.color === c ? '3px solid #1a1a2e' : '3px solid transparent',
              }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: f.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500 }}>{f.iniciales || '?'}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{f.nombre || 'Sin nombre'}</div>
          {f.dia && f.mes && <div style={{ fontSize: 12, color: '#888' }}>🎂 {f.dia} de {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(f.mes)-1]} {f.anio && `de ${f.anio}`}</div>}
        </div>
      </div>
      <button onClick={onGuardar} style={{ width: '100%', padding: 12, borderRadius: 10, background: '#7F77DD', color: 'white', border: 'none', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
        Guardar
      </button>
    </div>
  )

  if (mostrarNuevo) return (
    <FormAmigo
      f={formNuevo} setF={setFormNuevo}
      onGuardar={guardarNuevo}
      onCancelar={() => setMostrarNuevo(false)}
      titulo='Nuevo amigo'
    />
  )

  if (editando) return (
    <div>
      <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRefs.current[editando.id]?.click()}>
          <Avatar amigo={editando} size={80} />
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: '#7F77DD', border: '2px solid white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12
          }}>📷</div>
          <input ref={el => fileRefs.current[editando.id] = el} type='file' accept='image/*'
            style={{ display: 'none' }} onChange={e => subirFoto(editando, e.target.files[0])} />
        </div>
      </div>
      {subiendo && <div style={{ textAlign: 'center', fontSize: 12, color: '#7F77DD', marginBottom: 8 }}>Subiendo foto...</div>}
      <FormAmigo
        f={form} setF={setForm}
        onGuardar={guardar}
        onCancelar={() => setEditando(null)}
        titulo='Editar amigo'
      />
    </div>
  )

  const proximosCumples = amigos
    .filter(a => a.fecha_nacimiento)
    .map(a => ({ ...a, dias: diasParaCumple(a.fecha_nacimiento) }))
    .filter(a => a.dias <= 30)
    .sort((a, b) => a.dias - b.dias)

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>GRUPO · {amigos.length}</div>
        <button onClick={() => setMostrarNuevo(true)} style={{ background: '#7F77DD', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>+ Añadir</button>
      </div>

      {proximosCumples.length > 0 && (
        <div style={{ background: '#FAEEDA', borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#633806', marginBottom: 8 }}>🎂 CUMPLEAÑOS PRÓXIMOS</div>
          {proximosCumples.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Avatar amigo={a} size={24} />
              <span style={{ fontSize: 13, flex: 1, color: '#633806' }}>{a.nombre}</span>
              <span style={{ fontSize: 12, color: '#854F0B', fontWeight: 500 }}>
                {a.dias === 0 ? '¡Hoy! 🎉' : a.dias === 1 ? 'Mañana' : `en ${a.dias} días`}
              </span>
            </div>
          ))}
        </div>
      )}

      {amigos.map(a => {
        const dias = diasParaCumple(a.fecha_nacimiento)
        const cumpleProximo = dias !== null && dias <= 30
        return (
          <div key={a.id} onClick={() => abrirEditar(a)} style={{
            background: 'white', borderRadius: 12, padding: '12px 14px',
            marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', border: '1px solid #eee',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar amigo={a} size={44} />
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 16, height: 16, borderRadius: '50%',
                background: '#7F77DD', border: '1.5px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8
              }}>📷</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{a.nombre}</div>
              {a.fecha_nacimiento && (
                <div style={{ fontSize: 11, color: cumpleProximo ? '#854F0B' : '#888', marginTop: 2 }}>
                  🎂 {formatCumple(a.fecha_nacimiento)}
                  {cumpleProximo && <span style={{ fontWeight: 500 }}> · {dias === 0 ? '¡Hoy!' : dias === 1 ? 'mañana' : `en ${dias} días`}</span>}
                </div>
              )}
              {subiendo === a.id && <div style={{ fontSize: 11, color: '#7F77DD', marginTop: 2 }}>Subiendo foto...</div>}
            </div>
            <span style={{ color: '#ccc', fontSize: 18 }}>›</span>
          </div>
        )
      })}
    </div>
  )
}