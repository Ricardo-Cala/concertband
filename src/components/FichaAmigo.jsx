import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import Avatar from './Avatar'

const GENEROS = ['Rock', 'Pop', 'Indie', 'Electrónica', 'Jazz', 'Blues', 'Folk', 'Metal', 'Punk', 'Soul', 'R&B', 'Clásica', 'Reggae', 'Hip-hop']

export default function FichaAmigo({ amigo, amigos, onCerrar, onEditar }) {
  const [asistencias, setAsistencias] = useState([])
  const [conciertos, setConciertos] = useState([])
  const [artistas, setArtistas] = useState(amigo.artistas_favoritos || [])
  const [generos, setGeneros] = useState(amigo.generos_favoritos || [])
  const [nuevoArtista, setNuevoArtista] = useState('')
  const [editandoGustos, setEditandoGustos] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const { data: asis } = await supabase
      .from('asistentes')
      .select('*, conciertos(id, artista, fecha, ciudad)')
      .eq('amigo_id', amigo.id)
      .eq('confirmado', true)
    setAsistencias(asis || [])
    setConciertos((asis || []).map(a => a.conciertos).filter(Boolean))
  }

  const guardarGustos = async () => {
    setGuardando(true)
    await supabase.from('amigos').update({
      artistas_favoritos: artistas,
      generos_favoritos: generos,
    }).eq('id', amigo.id)
    setGuardando(false)
    setEditandoGustos(false)
  }

  const añadirArtista = () => {
    if (!nuevoArtista.trim()) return
    setArtistas(a => [...a, nuevoArtista.trim()])
    setNuevoArtista('')
  }

  const eliminarArtista = (i) => setArtistas(a => a.filter((_, idx) => idx !== i))

  const toggleGenero = (g) => setGeneros(gs =>
    gs.includes(g) ? gs.filter(x => x !== g) : [...gs, g]
  )

  const conciertosPerYear = conciertos.reduce((acc, c) => {
    if (!c?.fecha) return acc
    const year = new Date(c.fecha).getFullYear()
    acc[year] = (acc[year] || 0) + 1
    return acc
  }, {})

  const ciudades = conciertos.reduce((acc, c) => {
    if (!c?.ciudad) return acc
    acc[c.ciudad] = (acc[c.ciudad] || 0) + 1
    return acc
  }, {})
  const ciudadFavorita = Object.entries(ciudades).sort((a, b) => b[1] - a[1])[0]

  const coincidencias = amigos.filter(a => a.id !== amigo.id).map(a => {
    const ids = conciertos.map(c => c.id)
    return { amigo: a, count: 0 }
  })

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: '#f0f0f5', minHeight: '100vh' }}>
      <div style={{ background: '#1a1a2e', padding: '20px 16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', padding: 0 }}>‹</button>
          <button onClick={onEditar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>✏️ Editar</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Avatar amigo={amigo} size={80} />
          <div style={{ fontSize: 20, fontWeight: 600, color: 'white' }}>{amigo.nombre}</div>
          {amigo.fecha_nacimiento && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              🎂 {new Date(amigo.fecha_nacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* ESTADÍSTICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#7F77DD' }}>{conciertos.length}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Conciertos</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#7F77DD' }}>{Object.keys(ciudades).length}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Ciudades</div>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#7F77DD' }}>{Object.keys(conciertosPerYear).length}</div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Años</div>
          </div>
        </div>

        {/* CONCIERTOS POR AÑO */}
        {Object.keys(conciertosPerYear).length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 12 }}>CONCIERTOS POR AÑO</div>
            {Object.entries(conciertosPerYear).sort((a, b) => b[0] - a[0]).map(([year, count]) => (
              <div key={year} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{year}</span>
                  <span style={{ fontSize: 13, color: '#7F77DD', fontWeight: 500 }}>{count} concierto{count > 1 ? 's' : ''}</span>
                </div>
                <div style={{ height: 6, background: '#f0f0f5', borderRadius: 3 }}>
                  <div style={{ height: 6, background: '#7F77DD', borderRadius: 3, width: `${(count / Math.max(...Object.values(conciertosPerYear))) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CIUDAD FAVORITA */}
        {ciudadFavorita && (
          <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 8 }}>CIUDAD MÁS VISITADA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>📍</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{ciudadFavorita[0]}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{ciudadFavorita[1]} concierto{ciudadFavorita[1] > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {conciertos.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 10 }}>HISTORIAL</div>
            {conciertos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.artista}</span>
                <span style={{ fontSize: 12, color: '#888' }}>{new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            ))}
          </div>
        )}

        {/* GUSTOS MUSICALES */}
        <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#888' }}>GUSTOS MUSICALES</div>
            <button onClick={() => setEditandoGustos(!editandoGustos)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#7F77DD', cursor: 'pointer', fontWeight: 500 }}>
              {editandoGustos ? 'Cancelar' : '✏️ Editar'}
            </button>
          </div>

          {!editandoGustos && (
            <div>
              {artistas.length === 0 && generos.length === 0 && (
                <div style={{ fontSize: 13, color: '#aaa', textAlign: 'center', padding: '8px 0' }}>Sin gustos registrados todavía</div>
              )}
              {artistas.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Artistas favoritos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {artistas.map((a, i) => (
                      <span key={i} style={{ background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 500 }}>🎵 {a}</span>
                    ))}
                  </div>
                </div>
              )}
              {generos.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Géneros favoritos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {generos.map((g, i) => (
                      <span key={i} style={{ background: '#EAF3DE', color: '#27500A', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 500 }}>🎸 {g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {editandoGustos && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Artistas favoritos</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input value={nuevoArtista} onChange={e => setNuevoArtista(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && añadirArtista()}
                    placeholder='Ej: The Beatles'
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                  <button onClick={añadirArtista} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#7F77DD', color: 'white', fontSize: 13, cursor: 'pointer' }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {artistas.map((a, i) => (
                    <span key={i} style={{ background: '#EEEDFE', color: '#3C3489', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      🎵 {a}
                      <button onClick={() => eliminarArtista(i)} style={{ background: 'none', border: 'none', color: '#3C3489', cursor: 'pointer', fontSize: 12, padding: 0 }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Géneros favoritos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {GENEROS.map(g => (
                    <span key={g} onClick={() => toggleGenero(g)} style={{
                      borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      background: generos.includes(g) ? '#EAF3DE' : '#f0f0f5',
                      color: generos.includes(g) ? '#27500A' : '#888',
                      border: generos.includes(g) ? '1px solid #C0DD97' : '1px solid transparent',
                    }}>{g}</span>
                  ))}
                </div>
              </div>

              <button onClick={guardarGustos} disabled={guardando} style={{
                width: '100%', padding: 10, borderRadius: 10, border: 'none',
                background: '#7F77DD', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer'
              }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}