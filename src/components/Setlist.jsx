import { useState } from 'react'
import { supabase } from '../supabase'

export default function Setlist({ concierto, onActualizado }) {
  const [editando, setEditando] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState(concierto.spotify_url || '')
  const [setlistText, setSetlistText] = useState(concierto.setlist || '')
  const [guardando, setGuardando] = useState(false)

  const guardar = async () => {
    setGuardando(true)
    await supabase.from('conciertos').update({
      spotify_url: spotifyUrl || null,
      setlist: setlistText || null,
    }).eq('id', concierto.id)
    setGuardando(false)
    setEditando(false)
    onActualizado()
  }

  const abrirSpotify = () => {
    if (!concierto.spotify_url) return
    let url = concierto.spotify_url
    if (url.includes('open.spotify.com')) {
      url = url.replace('https://open.spotify.com', 'spotify:')
        .replace('/playlist/', ':playlist:')
        .replace('/album/', ':album:')
        .replace('/track/', ':track:')
      window.location.href = url
      setTimeout(() => { window.open(concierto.spotify_url, '_blank') }, 1000)
    } else {
      window.open(url, '_blank')
    }
  }

  const canciones = concierto.setlist
    ? concierto.setlist.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    : []

  if (editando) return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>EDITAR SETLIST</div>
        <button onClick={() => setEditando(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#888', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
            Enlace de playlist en Spotify
          </label>
          <input value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)}
            placeholder='https://open.spotify.com/playlist/...'
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }} />
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
            Abre Spotify → playlist → compartir → copiar enlace
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>
            Setlist — una canción por línea
          </label>
          <textarea value={setlistText} onChange={e => setSetlistText(e.target.value)}
            placeholder={'Enter Sandman\nNothing Else Matters\nOne\nMaster of Puppets'}
            rows={8}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        width: '100%', padding: 12, borderRadius: 10,
        background: '#1DB954', color: 'white', border: 'none',
        fontSize: 15, fontWeight: 500, cursor: 'pointer'
      }}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#888' }}>SETLIST</div>
        <button onClick={() => setEditando(true)} style={{
          background: 'none', border: '1px solid #eee', borderRadius: 20,
          padding: '4px 12px', fontSize: 12, color: '#888', cursor: 'pointer'
        }}>✏️ Editar</button>
      </div>

      {concierto.spotify_url && (
        <button onClick={abrirSpotify} style={{
          width: '100%', padding: 14, borderRadius: 12, border: 'none',
          background: '#1DB954', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 16, fontSize: 15, fontWeight: 500,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Abrir playlist en Spotify
        </button>
      )}

      {canciones.length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 10 }}>
            {canciones.length} CANCIONES
          </div>
          {canciones.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 0',
              borderBottom: i < canciones.length - 1 ? '0.5px solid #f0f0f0' : 'none'
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: '#f0f0f0', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, color: '#888',
                flexShrink: 0, fontWeight: 500
              }}>{i + 1}</div>
              <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{c}</span>
            </div>
          ))}
        </div>
      )}

      {!concierto.spotify_url && canciones.length === 0 && (
        <div style={{
          background: 'white', borderRadius: 12, padding: 24,
          textAlign: 'center', border: '1px dashed #ddd'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#888', marginBottom: 4 }}>Sin setlist todavía</div>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 14 }}>Añade la playlist de Spotify o las canciones del concierto</div>
          <button onClick={() => setEditando(true)} style={{
            background: '#1DB954', color: 'white', border: 'none',
            borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer'
          }}>+ Añadir setlist</button>
        </div>
      )}
    </div>
  )
}