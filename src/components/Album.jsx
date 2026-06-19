import { useState, useEffect, useRef } from 'react'
import { Camera, Download, Trash2 } from 'lucide-react'
import { supabase } from '../supabase'

export default function Album({ concierto }) {
  const [fotos, setFotos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [fotoGrande, setFotoGrande] = useState(null)
  const fileRef = useRef()

  useEffect(() => { cargarFotos() }, [])

  const cargarFotos = async () => {
    const { data } = await supabase
      .from('fotos')
      .select('*')
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
      const { error } = await supabase.storage.from('fotos-conciertos').upload(path, archivo)
      if (!error) {
        const { data } = supabase.storage.from('fotos-conciertos').getPublicUrl(path)
        await supabase.from('fotos').insert([{ concierto_id: concierto.id, url: data.publicUrl }])
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Fotos · {fotos.length}</div>
        <label style={{
          background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
          color: 'var(--warm-grey)', border: 'none', borderRadius: 20,
          padding: '7px 16px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
          fontFamily: 'inherit',
        }}>
          {subiendo ? 'Subiendo...' : '📸 Añadir'}
          <input ref={fileRef} type='file' accept='image/*' multiple style={{ display: 'none' }}
            onChange={e => subirFotos(Array.from(e.target.files))} disabled={subiendo} />
        </label>
      </div>

      {fotos.length === 0 && (
        <div style={{
          background: 'var(--bg)', borderRadius: 20, padding: 30, textAlign: 'center',
          boxShadow: 'inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}><Camera size={28} /></div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em' }}>Sin fotos todavía</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>Sé el primero en subir fotos del concierto</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {fotos.map(foto => (
          <div key={foto.id} onClick={() => setFotoGrande(foto)}
            style={{
              cursor: 'pointer', aspectRatio: '1', overflow: 'hidden', borderRadius: 14,
              boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
            }}>
            <img src={foto.url} alt='' style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ))}
      </div>

      {fotoGrande && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(60,48,40,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 300, padding: 16,
          backdropFilter: 'blur(4px)',
        }} onClick={() => setFotoGrande(null)}>
          <img src={fotoGrande.url} alt=''
            style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 14, objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }} onClick={e => e.stopPropagation()}>
            <button onClick={() => window.open(fotoGrande.url, '_blank')} style={{
              background: 'rgba(245,239,230,0.15)', border: 'none', borderRadius: 20,
              padding: '9px 18px', color: 'var(--sage-light)', fontSize: 11, cursor: 'pointer',
              fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'inherit',
            }}><Download size={14} style={{marginRight:4}} />Descargar</button>
            <button onClick={() => borrarFoto(fotoGrande)} style={{
              background: 'linear-gradient(145deg, #C87070, #A85050)', border: 'none', borderRadius: 20,
              padding: '9px 18px', color: '#fff', fontSize: 11, cursor: 'pointer',
              fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'inherit',
            }}><Trash2 size={14} style={{marginRight:4}} />Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}
