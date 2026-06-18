import { writeFileSync } from 'fs'

const fichaAmigoCode = `import { useState, useEffect } from 'react'
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

    const mapaConciertos = new Map()
    ;(asis || []).forEach(a => {
      if (a.conciertos && a.conciertos.id && !mapaConciertos.has(a.conciertos.id)) {
        mapaConciertos.set(a.conciertos.id, a.conciertos)
      }
    })
    setConciertos(Array.from(mapaConciertos.values()))
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

  const card = {
    background: 'var(--bg)', borderRadius: 18, padding: 16, marginBottom: 14,
    boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
  }
  const tituloSeccion = {
    fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14,
    letterSpacing: '0.25em', textTransform: 'uppercase',
  }
  const inputStyle = {
    flex: 1, padding: '10px 14px', borderRadius: 12, border: 'none',
    background: 'var(--bg)',
    boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
    fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
        padding: '22px 18px 28px',
        boxShadow: '0 6px 16px rgba(60,48,40,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <button onClick={onCerrar} style={{
            background: 'rgba(245,239,230,0.1)', border: 'none', color: 'var(--sage-light)',
            fontSize: 22, cursor: 'pointer', width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}>‹</button>
          <button onClick={onEditar} style={{
            background: 'rgba(245,239,230,0.1)', border: 'none', color: 'var(--sage-light)',
            borderRadius: 14, padding: '6px 14px', fontSize: 10, cursor: 'pointer',
            letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
            fontFamily: 'inherit',
          }}>✏️ Editar</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Avatar amigo={amigo} size={86} />
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--sage-light)', letterSpacing: '0.06em' }}>{amigo.nombre}</div>
          {amigo.fecha_nacimiento && (
            <div style={{ fontSize: 10, color: 'rgba(245,239,230,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              🎂 {new Date(amigo.fecha_nacimiento).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* ESTADÍSTICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ ...card, padding: 14, textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 300, color: 'var(--sage-dark)' }}>{conciertos.length}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Conciertos</div>
          </div>
          <div style={{ ...card, padding: 14, textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 300, color: 'var(--sage-dark)' }}>{Object.keys(ciudades).length}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Ciudades</div>
          </div>
          <div style={{ ...card, padding: 14, textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 300, color: 'var(--sage-dark)' }}>{Object.keys(conciertosPerYear).length}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Años</div>
          </div>
        </div>

        {/* CONCIERTOS POR AÑO */}
        {Object.keys(conciertosPerYear).length > 0 && (
          <div style={card}>
            <div style={tituloSeccion}>Conciertos por año</div>
            {Object.entries(conciertosPerYear).sort((a, b) => b[0] - a[0]).map(([year, count]) => (
              <div key={year} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{year}</span>
                  <span style={{ fontSize: 11, color: 'var(--sage-dark)', fontWeight: 700, letterSpacing: '0.05em' }}>{count} concierto{count > 1 ? 's' : ''}</span>
                </div>
                <div style={{
                  height: 8, borderRadius: 4,
                  background: 'var(--bg)',
                  boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--sage), var(--sage-dark))',
                    borderRadius: 4,
                    width: \`\${(count / Math.max(...Object.values(conciertosPerYear))) * 100}%\`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CIUDAD FAVORITA */}
        {ciudadFavorita && (
          <div style={card}>
            <div style={tituloSeccion}>Ciudad más visitada</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                fontSize: 26, width: 50, height: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                borderRadius: '50%',
                boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
              }}>📍</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>{ciudadFavorita[0]}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, letterSpacing: '0.04em' }}>{ciudadFavorita[1]} concierto{ciudadFavorita[1] > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {conciertos.length > 0 && (() => {
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          return (
            <div style={card}>
              <div style={tituloSeccion}>Historial</div>
              {conciertos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(c => {
                const fechaConcierto = new Date(c.fecha)
                fechaConcierto.setHours(0, 0, 0, 0)
                const pasado = fechaConcierto < hoy
                return (
                  <div key={c.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '0.5px solid var(--bg-dark)',
                    opacity: pasado ? 0.55 : 1,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{c.artista}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* GUSTOS MUSICALES */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={tituloSeccion}>Gustos musicales</div>
            <button onClick={() => setEditandoGustos(!editandoGustos)} style={{
              background: 'none', border: 'none', fontSize: 10, color: 'var(--sage-dark)',
              cursor: 'pointer', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
              fontFamily: 'inherit',
            }}>
              {editandoGustos ? 'Cancelar' : '✏️ Editar'}
            </button>
          </div>

          {!editandoGustos && (
            <div>
              {artistas.length === 0 && generos.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0', letterSpacing: '0.05em' }}>Sin gustos registrados todavía</div>
              )}
              {artistas.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Artistas favoritos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {artistas.map((a, i) => (
                      <span key={i} style={{
                        background: 'var(--bg)', color: 'var(--text-primary)',
                        borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 600,
                        letterSpacing: '0.04em',
                        boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                      }}>🎵 {a}</span>
                    ))}
                  </div>
                </div>
              )}
              {generos.length > 0 && (
                <div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Géneros favoritos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {generos.map((g, i) => (
                      <span key={i} style={{
                        background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                        color: 'var(--warm-grey)',
                        borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 700,
                        letterSpacing: '0.04em',
                        boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                      }}>🎸 {g}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {editandoGustos && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Artistas favoritos</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input value={nuevoArtista} onChange={e => setNuevoArtista(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && añadirArtista()}
                    placeholder='Ej: The Beatles' style={inputStyle} />
                  <button onClick={añadirArtista} style={{
                    padding: '8px 16px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
                    color: 'var(--warm-grey)', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                    fontFamily: 'inherit',
                  }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {artistas.map((a, i) => (
                    <span key={i} style={{
                      background: 'var(--bg)', color: 'var(--text-primary)',
                      borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.04em',
                      boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      🎵 {a}
                      <button onClick={() => eliminarArtista(i)} style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: 12, padding: 0, fontFamily: 'inherit',
                      }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 700 }}>Géneros favoritos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {GENEROS.map(g => (
                    <span key={g} onClick={() => toggleGenero(g)} style={{
                      borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      letterSpacing: '0.04em',
                      background: generos.includes(g)
                        ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
                        : 'var(--bg)',
                      color: generos.includes(g) ? 'var(--warm-grey)' : 'var(--text-secondary)',
                      boxShadow: generos.includes(g)
                        ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)'
                        : 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                      transition: 'all 0.15s',
                    }}>{g}</span>
                  ))}
                </div>
              </div>

              <button onClick={guardarGustos} disabled={guardando} style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none',
                background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
                color: 'var(--warm-grey)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.2em', textTransform: 'uppercase',
                boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
                fontFamily: 'inherit',
              }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
`

writeFileSync('src/components/FichaAmigo.jsx', fichaAmigoCode)
console.log('✔ src/components/FichaAmigo.jsx actualizado (Fase 3B)')