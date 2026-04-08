import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function Album({ concierto, amigos }) {
  const [fotos, setFotos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [fotoGrande, setFotoGrande] = useState(null)
  const [amigoSeleccionado, setAmigoSeleccionado] = useState('')
  const fileRef = useRef()

  useEffect(() => { cargarFotos() }, [])

  const cargarFotos = async () => {
    const { data } = await supabase
      .from('fotos')
      .select('*, amigos(nombre, iniciales, color, foto_url)')
      .eq('concierto_id', concierto.id)
      .order('created_at', { ascending: false })
    setFotos(data || [])
  }

  const subirFotos = async (archivos) => {
    if (!archivos || archivos.length === 0) return
    setSubiendo(true)
    for (const archivo of archivos) {
      const ext = archivo.name.split('.').pop() || 'jpg'
      const path = concierto.id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext
      const { error } = await supabase.storage.from('fotos-conciertos').upload(path, archivo, { upsert: false })
      if (!error) {
        const { data } = supabase.storage.from('fotos-conciertos').getPublicUrl(path)
        await supabase.from('fotos').insert([{
          concierto_id: concierto.id,
          amigo_id: amigoSeleccionado || null,
          url: data.publicUrl,
        }])
      }
    }
    setSubiendo(false)
    cargarFotos()
  }

  const borrarFoto = async (foto) => {
    if (!confirm('¿Eliminar esta foto?')) return
    const path = foto.url.split('/fotos-conciertos/')[1]
    await supabase.storage.from('fotos-conciertos').remove([path])
    await supabase.from('fotos').delete().eq('id', foto.id)
    setFotoGrande(null)
    cargarFotos()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>
          FOTOS · {fotos.length}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 14, border: '1px solid #eee' }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>¿Quién sube las fotos?</div>
        <select value={amigoSeleccionado} onChange={e => setAmigoSeleccionado(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, background: 'white', marginBottom: 10 }}>
          <option value=''>— Selecciona tu nombre —</option>
          {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', padding: 12, borderRadius: 10,
          background: '#7F77DD', color: 'white', border: 'none',
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>
          📸 {subiendo ? 'Subiendo...' : 'Añadir fotos'}
          <input ref={fileRef} type='file' accept='image/*' multiple style={{ display: 'none' }}
            onChange={e => subirFotos(Array.from(e.target.files))}
            disabled={subiendo} />
        </label>
      </div>

      {fotos.length === 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 30, textAlign: 'center', border: '1px dashed #ddd' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>Sin fotos todavía</div>
          <div style={{ fontSize: 12, color: '#aaa' }}>Sé el primero en subir fotos del concierto</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
        {fotos.map(foto => (
          <div key={foto.id} onClick={() => setFotoGrande(foto)} style={{ position: 'relative', cursor: 'pointer', aspectRatio: '1', overflow: 'hidden', borderRadius: 8 }}>
            <img src={foto.url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {foto.amigos && (
              <div style={{ position: 'absolute', bottom: 4, left: 4 }}>
                <Avatar amigo={foto.amigos} size={20} />
              </div>
            )}
          </div>
        ))}
      </div>

      {fotoGrande && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 300, padding: 16
        }} onClick={() => setFotoGrande(null)}>
          <img src={fotoGrande.url} alt='' style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8, objectFit: 'contain' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }} onClick={e => e.stopPropagation()}>
            {fotoGrande.amigos && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar amigo={fotoGrande.amigos} size={28} />
                <span style={{ fontSize: 13, color: 'white' }}>{fotoGrande.amigos.nombre}</span>
              </div>
            )}
            <button onClick={() => borrarFoto(fotoGrande)} style={{
              background: '#E24B4A', border: 'none', borderRadius: 20,
              padding: '6px 14px', color: 'white', fontSize: 12, cursor: 'pointer', marginLeft: 'auto'
            }}>🗑️ Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}