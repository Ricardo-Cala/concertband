import { writeFileSync } from 'fs'

const code = `import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

export default function Album({ concierto, amigos }) {
  const [fotos, setFotos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [fotoGrande, setFotoGrande] = useState(null)
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
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>FOTOS · {fotos.length}</div>
        <label style={{
          background: '#7F77DD', color: 'white', border: 'none',
          borderRadius: 20, padding: '6px 14px', fontSize: 12,
          fontWeight: 500, cursor: 'pointer'
        }}>
          {subiendo ? 'Subiendo...' : '📸 Añadir'}
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
          <div key={foto.id} onClick={() => setFotoGrande(foto)}
            style={{ position: 'relative', cursor: 'pointer', aspectRatio: '1', overflow: 'hidden', borderRadius: 8 }}>
            <img src={foto.url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>

      {fotoGrande && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 300, padding: 16
        }} onClick={() => setFotoGrande(null)}>
          <img src={fotoGrande.url} alt=''
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => window.open(fotoGrande.url, '_blank')} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20,
              padding: '8px 16px', color: 'white', fontSize: 13, cursor: 'pointer'
            }}>⬇️ Descargar</button>
            <button onClick={() => borrarFoto(fotoGrande)} style={{
              background: '#E24B4A', border: 'none', borderRadius: 20,
              padding: '8px 16px', color: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 500
            }}>🗑️ Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}`
import { readFileSync } from 'fs'

let ficha = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

ficha = ficha.replace(
  `        {subtab === 'fotos' && (
          <Album concierto={concierto} amigos={amigos} />
        )}
        {subtab === 'fotos' && (
          <Album concierto={concierto} amigos={amigos} />
        )}`,
  `        {subtab === 'fotos' && (
          <Album concierto={concierto} amigos={amigos} />
        )}`
)

require('fs').writeFileSync('src/components/FichaConcierto.jsx', ficha)
console.log('FichaConcierto limpiado')

writeFileSync('src/components/Album.jsx', code)
console.log('Album.jsx reescrito limpio')