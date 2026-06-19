import { useState } from 'react'
import { supabase } from '../supabase'

export default function Setlist({ concierto, onActualizado }) {
  const [editando, setEditando] = useState(false)
  const [spotifyUrl, setSpotifyUrl] = useState(concierto.spotify_url || '')
  const [setlistText, setSetlistText] = useState(concierto.setlist || '')
  const [guardando, setGuardando] = useState(false)

  const inputNeu = {
    width: '100%', padding: '11px 14px', borderRadius: 12, border: 'none',
    background: 'var(--bg)',
    boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
    fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelNeu = {
    fontSize: 10, color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
    fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
  }

  const guardar = async () => {
    setGuardando(true)
    await supabase.from('conciertos').update({
      spotify_url: spotifyUrl || null,
      setlist: setlistText || null,
    }).eq('id', concierto.id)
    concierto.spotify_url = spotifyUrl
    concierto.setlist = setlistText
    setGuardando(false)
    setEditando(false)
  }

  const abrirSpotify = () => {
    const url = concierto.spotify_url
    if (!url) return
    window.open(url, '_blank')
  }

  const abrirSetlistFm = () => {
    const artista = encodeURIComponent(concierto.artista)
    window.open('https://www.setlist.fm/search?query=' + artista, '_blank')
  }

  const canciones = concierto.setlist
    ? concierto.setlist.split('\n').map(s => s.trim()).filter(s => s.length > 0)
    : []

  if (editando) return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Editar setlist</div>
        <button onClick={() => setEditando(false)} style={{
          background: 'var(--bg)', border: 'none', borderRadius: '50%',
          width: 34, height: 34, fontSize: 15, color: 'var(--text-secondary)',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        }}>✕</button>
      </div>

      <div style={{
        background: 'var(--bg)', borderRadius: 18, padding: 18, marginBottom: 14,
        boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      }}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelNeu}>Enlace de playlist en Spotify</label>
          <input value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)}
            placeholder='https://open.spotify.com/playlist/...' style={inputNeu} />
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6, letterSpacing: '0.04em' }}>
            Abre Spotify → playlist → compartir → copiar enlace
          </div>
        </div>
        <div>
          <label style={labelNeu}>Setlist — una canción por línea</label>
          <textarea value={setlistText} onChange={e => setSetlistText(e.target.value)}
            placeholder={'Enter Sandman\nNothing Else Matters\nOne'}
            rows={8}
            style={{ ...inputNeu, resize: 'vertical', lineHeight: 1.6 }} />
        </div>
      </div>

      <button onClick={guardar} disabled={guardando} style={{
        width: '100%', padding: 14, borderRadius: 16,
        background: '#1DB954', color: 'white', border: 'none',
        fontSize: 11, fontWeight: 700, cursor: 'pointer',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
        fontFamily: 'inherit',
      }}>
        {guardando ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Setlist</div>
        <button onClick={() => setEditando(true)} style={{
          background: 'var(--bg)', border: 'none', borderRadius: 20,
          padding: '6px 14px', fontSize: 10, color: 'var(--text-secondary)',
          cursor: 'pointer', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
          fontFamily: 'inherit',
        }}>✏️ Editar</button>
      </div>

      {concierto.spotify_url ? (
        <button onClick={abrirSpotify} style={{
          width: '100%', padding: 14, borderRadius: 16, border: 'none',
          background: '#1DB954', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 14, fontSize: 12, fontWeight: 700,
          letterSpacing: '0.08em',
          boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
          fontFamily: 'inherit',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Abrir playlist en Spotify
        </button>
      ) : (
        <div style={{
          background: 'var(--bg)', borderRadius: 18, padding: 18, marginBottom: 14, textAlign: 'center',
          boxShadow: 'inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.05em' }}>Sin playlist de Spotify todavía</div>
          <button onClick={() => setEditando(true)} style={{
            background: '#1DB954', color: 'white', border: 'none',
            borderRadius: 20, padding: '7px 18px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'inherit',
            boxShadow: '3px 3px 6px var(--shadow-dark)',
          }}>+ Añadir playlist</button>
        </div>
      )}

      <button onClick={abrirSetlistFm} style={{
        width: '100%', padding: 13, borderRadius: 16, border: 'none',
        background: '#D4613A', color: 'white', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginBottom: 18, fontSize: 12, fontWeight: 700,
        letterSpacing: '0.08em',
        boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
        fontFamily: 'inherit',
      }}>
        🎵 Ver setlist en setlist.fm
      </button>

      {canciones.length > 0 && (
        <div style={{
          background: 'var(--bg)', borderRadius: 18, padding: 18,
          boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            {canciones.length} canciones
          </div>
          {canciones.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0',
              borderBottom: i < canciones.length - 1 ? '0.5px solid var(--bg-dark)' : 'none'
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 10, color: 'var(--text-secondary)',
                flexShrink: 0, fontWeight: 700,
                boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
              }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.03em' }}>{c}</span>
            </div>
          ))}
        </div>
      )}

      {!concierto.spotify_url && canciones.length === 0 && (
        <div style={{
          background: 'var(--bg)', borderRadius: 20, padding: 28, textAlign: 'center',
          boxShadow: 'inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '0.04em' }}>Sin setlist todavía</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>Añade la playlist de Spotify o las canciones</div>
        </div>
      )}
    </div>
  )
}
