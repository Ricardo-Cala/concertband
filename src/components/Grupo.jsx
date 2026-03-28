import { useState, useRef } from 'react'
import { supabase } from '../supabase'

export default function Grupo({ amigos, onActualizado }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', iniciales: '', color: '#534AB7' })
  const [subiendo, setSubiendo] = useState(false)
  const [confirmaBorrar, setConfirmaBorrar] = useState(null)
  const fileRef = useRef()

  const colores = [
    '#534AB7', '#0F6E56', '#993C1D', '#185FA5',
    '#993556', '#3B6D11', '#BA7517', '#D85A30', '#1D9E75'
  ]

  const abrirNuevo = () => {
    setEditando(null)
    setForm({ nombre: '', iniciales: '', color: '#534AB7' })
    setMostrarForm(true)
  }

  const abrirEditar = (amigo) => {
    setEditando(amigo)
    setForm({ nombre: amigo.nombre, iniciales: amigo.iniciales, color: amigo.color })
    setMostrarForm(true)
  }

  const guardar = async () => {
    if (!form.nombre || !form.iniciales) {
      alert('Rellena nombre e iniciales')
      return
    }
    if (editando) {
      await supabase.from('amigos').update({
        nombre: form.nombre,
        iniciales: form.iniciales,
        color: form.color,
      }).eq('id', editando.id)
    } else {
      await supabase.from('amigos').insert([{
        nombre: form.nombre,
        iniciales: form.iniciales,
        color: form.color,
      }])
    }
    setMostrarForm(false)
    onActualizado()
  }

  const borrar = async (id) => {
    await supabase.from('amigos').delete().eq('id', id)
    setConfirmaBorrar(null)
    onActualizado()
  }

  const subirFoto = async (amigo, archivo) => {
    if (!archivo) return
    setSubiendo(amigo.id)
    const ext = archivo.name.split('.').pop()
    const path = `${amigo.id}.${ext}`

    await supabase.storage.from('avatares').upload(path, archivo, { upsert: true })

    const { data } = supabase.storage.from('avatares').getPublicUrl(path)
    await supabase.from('amigos').update({ foto_url: data.publicUrl }).eq('id', amigo.id)

    setSubiendo(null)
    onActualizado()
  }

  if (mostrarForm) return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 500 }}>{editando ? 'Editar amigo' : 'Nuevo amigo'}</h2>
        <button onClick={() => setMostrarForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888' }}>✕</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Nombre *</label>
          <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            placeholder='Ej: Bárbara'
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Iniciales *</label>
          <input value={form.iniciales} onChange={e => setForm(f => ({ ...f, iniciales: e.target.value.slice(0, 2) }))}
            placeholder='Ej: Bá' maxLength={2}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>Color del avatar</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colores.map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid #1a1a2e' : '3px solid transparent',
                  transition: 'border 0.15s'
                }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: form.color,
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 500
        }}>{form.iniciales || '?'}</div>
        <span style={{ fontSize: 13, color: '#888' }}>Así se verá el avatar</span>
      </div>

      <button onClick={guardar} style={{
        width: '100%', padding: 12, borderRadius: 10,
        background: '#7F77DD', color: 'white', border: 'none',
        fontSize: 15, fontWeight: 500
      }}>
        {editando ? 'Guardar cambios' : 'Añadir al grupo'}
      </button>
    </div>
  )

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>GRUPO · {amigos.length}</div>
        <button onClick={abrirNuevo} style={{
          background: '#7F77DD', color: 'white', border: 'none',
          borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 500
        }}>+ Añadir</button>
      </div>

      {amigos.map(a => (
        <div key={a.id} style={{
          background: 'white', borderRadius: 12, padding: '12px 14px',
          marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {a.foto_url ? (
              <img src={a.foto_url} alt={a.nombre}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: a.color,
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 500
              }}>{a.iniciales}</div>
            )}
            <button
              onClick={() => fileRef.current.click()}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', border: 'none', color: 'white',
                fontSize: 14, cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>📷</button>
            <input ref={fileRef} type='file' accept='image/*' style={{ display: 'none' }}
              onChange={e => subirFoto(a, e.target.files[0])} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{a.nombre}</div>
            {subiendo === a.id && <div style={{ fontSize: 11, color: '#7F77DD' }}>Subiendo foto...</div>}
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => abrirEditar(a)} style={{
              background: 'none', border: '1px solid #eee', borderRadius: 8,
              padding: '4px 10px', fontSize: 12, color: '#888', cursor: 'pointer'
            }}>✏️</button>
            <button onClick={() => setConfirmaBorrar(a.id)} style={{
              background: 'none', border: '1px solid #FCEBEB', borderRadius: 8,
              padding: '4px 10px', fontSize: 12, color: '#E24B4A', cursor: 'pointer'
            }}>🗑️</button>
          </div>
        </div>
      ))}

      {confirmaBorrar && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: 'white', borderRadius: 14, padding: 20, margin: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 14, marginBottom: 16 }}>¿Eliminar a este amigo del grupo?</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmaBorrar(null)} style={{
                flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ddd', background: 'white', fontSize: 13
              }}>Cancelar</button>
              <button onClick={() => borrar(confirmaBorrar)} style={{
                flex: 1, padding: 10, borderRadius: 8, border: 'none',
                background: '#E24B4A', color: 'white', fontSize: 13, fontWeight: 500
              }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}