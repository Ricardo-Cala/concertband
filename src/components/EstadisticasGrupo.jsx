import { useMemo } from 'react'
import { ArrowLeft, TrendingUp, MapPin, Euro, Calendar, Music2, Trophy, Mic, Ticket, Sparkles } from 'lucide-react'
import Avatar from './Avatar'

export default function EstadisticasGrupo({ conciertos, amigos, asistentes, gastos, onBack }) {

  const stats = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const conciertosPasados = (conciertos || []).filter(c => new Date(c.fecha) < hoy)

    const totalConciertos = conciertosPasados.length

    const ciudadesUnicas = new Set(conciertosPasados.map(c => c.ciudad).filter(Boolean))
    const totalCiudades = ciudadesUnicas.size

    const totalInvertido = (gastos || []).reduce((sum, g) => {
      const precio = parseFloat(g.precio_entrada) || 0
      const cant = parseInt(g.cantidad) || 0
      return sum + (precio * cant)
    }, 0)

    const porAno = {}
    conciertosPasados.forEach(c => {
      const ano = new Date(c.fecha).getFullYear()
      porAno[ano] = (porAno[ano] || 0) + 1
    })
    const datosPorAno = Object.keys(porAno).sort().map(ano => ({
      ano: parseInt(ano),
      cantidad: porAno[ano]
    }))
    const maxAno = datosPorAno.length > 0 ? Math.max(...datosPorAno.map(d => d.cantidad)) : 0

    let anoMasActivo = null
    let maxConciertosAno = 0
    Object.entries(porAno).forEach(([ano, cant]) => {
      if (cant > maxConciertosAno) {
        maxConciertosAno = cant
        anoMasActivo = ano
      }
    })

    const idsConciertosPasados = new Set(conciertosPasados.map(c => c.id))
    const asistenciaPorAmigo = {}
    ;(asistentes || []).forEach(a => {
      if (a.confirmado === true && idsConciertosPasados.has(a.concierto_id)) {
        asistenciaPorAmigo[a.amigo_id] = (asistenciaPorAmigo[a.amigo_id] || 0) + 1
      }
    })

    const ranking = (amigos || [])
      .map(amigo => ({ ...amigo, conciertos: asistenciaPorAmigo[amigo.id] || 0 }))
      .sort((a, b) => b.conciertos - a.conciertos)

    const maxRanking = ranking.length > 0 ? ranking[0].conciertos : 0
    const conciertero = ranking.length > 0 && ranking[0].conciertos > 0 ? ranking[0] : null

    const ciudadesCount = {}
    conciertosPasados.forEach(c => {
      if (c.ciudad) ciudadesCount[c.ciudad] = (ciudadesCount[c.ciudad] || 0) + 1
    })
    const topCiudades = Object.entries(ciudadesCount)
      .map(([ciudad, cant]) => ({ ciudad, cantidad: cant }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8)

    const artistasCount = {}
    conciertosPasados.forEach(c => {
      if (!c.artista) return
      const partes = c.artista
        .split(/\s*&\s*|\s*\+\s*|\s*,\s*|\s+Y\s+/i)
        .map(p => p.trim())
        .filter(Boolean)
      partes.forEach(nombre => {
        artistasCount[nombre] = (artistasCount[nombre] || 0) + 1
      })
    })
    const artistaTop = Object.entries(artistasCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]

    let conciertoMasCaro = null
    let precioMaximo = 0
    ;(gastos || []).forEach(g => {
      const precio = parseFloat(g.precio_entrada) || 0
      if (precio > precioMaximo) {
        precioMaximo = precio
        const concierto = conciertosPasados.find(c => c.id === g.concierto_id)
        if (concierto) conciertoMasCaro = { ...concierto, precio }
      }
    })

    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    const mesesCount = {}
    conciertosPasados.forEach(c => {
      const mes = new Date(c.fecha).getMonth()
      mesesCount[mes] = (mesesCount[mes] || 0) + 1
    })
    let mesFavorito = null
    let maxMes = 0
    Object.entries(mesesCount).forEach(([mes, cant]) => {
      if (cant > maxMes) {
        maxMes = cant
        mesFavorito = { nombre: meses[parseInt(mes)], cantidad: cant }
      }
    })

    return {
      totalConciertos, totalCiudades, totalInvertido,
      anoMasActivo, maxConciertosAno,
      datosPorAno, maxAno,
      ranking, maxRanking, conciertero,
      topCiudades, artistaTop, conciertoMasCaro, mesFavorito
    }
  }, [conciertos, amigos, asistentes, gastos])

  const formatEuro = (n) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(n)

  const card = {
    background: 'var(--bg)', borderRadius: 20, padding: 18, marginBottom: 14,
    boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
  }
  const tituloSeccion = {
    margin: '0 0 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
    letterSpacing: '0.25em', textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', gap: 8,
  }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh', paddingBottom: 30 }}>

      <div style={{
        background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
        padding: '18px 16px',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 6px 16px rgba(60,48,40,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onBack} style={{
            background: 'rgba(245,239,230,0.12)', border: 'none', borderRadius: '50%',
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--sage-light)', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--sage-light)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{<><TrendingUp size={14} /> Estadísticas</>}</h1>
            <p style={{ margin: '4px 0 0', fontSize: 9, color: 'rgba(245,239,230,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Vuestra historia en números</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* HERO STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <HeroCard icon={<Music2 size={14} />} valor={stats.totalConciertos} label='Conciertos' />
          <HeroCard icon={<MapPin size={14} />} valor={stats.totalCiudades} label='Ciudades' />
          <HeroCard icon={<Euro size={14} />} valor={formatEuro(stats.totalInvertido)} label='Invertido' isText />
          <HeroCard icon={<Calendar size={14} />} valor={stats.anoMasActivo || '—'} label={stats.anoMasActivo ? stats.maxConciertosAno + ' conciertos' : 'Sin datos'} isText />
        </div>

        {/* GRÁFICA POR AÑO */}
        {stats.datosPorAno.length > 0 && (
          <div style={card}>
            <h2 style={tituloSeccion}>
              <TrendingUp size={14} />
              Conciertos por año
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, padding: '8px 0', gap: 10 }}>
              {stats.datosPorAno.map(({ ano, cantidad }) => {
                const altura = stats.maxAno > 0 ? (cantidad / stats.maxAno) * 100 : 0
                return (
                  <div key={ano} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sage-dark)', textAlign: 'center', marginBottom: 6 }}>
                        {cantidad}
                      </div>
                      <div style={{
                        background: 'linear-gradient(180deg, var(--sage), var(--sage-dark))',
                        height: altura + '%',
                        minHeight: cantidad > 0 ? 8 : 2,
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.6s ease',
                        boxShadow: '2px 2px 4px var(--shadow-dark)',
                      }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 700, letterSpacing: '0.1em' }}>{ano}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RANKING */}
        {stats.ranking.length > 0 && (
          <div style={card}>
            <h2 style={tituloSeccion}>
              <Trophy size={14} />
              Ranking de asistencia
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.ranking.map((amigo, idx) => {
                const porcentaje = stats.maxRanking > 0 ? (amigo.conciertos / stats.maxRanking) * 100 : 0
                const medalla = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
                return (
                  <div key={amigo.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, textAlign: 'center', fontSize: 16 }}>
                      {medalla || <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 700 }}>{idx + 1}</span>}
                    </div>
                    <Avatar amigo={amigo} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '0.04em' }}>{amigo.nombre}</div>
                      <div style={{
                        height: 8, borderRadius: 4,
                        background: 'var(--bg)',
                        boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: porcentaje + '%',
                          background: amigo.color || 'var(--sage-dark)',
                          borderRadius: 4,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--sage-dark)', minWidth: 26, textAlign: 'right' }}>
                      {amigo.conciertos}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TOP CIUDADES */}
        {stats.topCiudades.length > 0 && (
          <div style={card}>
            <h2 style={tituloSeccion}>
              <MapPin size={14} />
              Ciudades visitadas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.topCiudades.map(({ ciudad, cantidad }, idx) => (
                <div key={ciudad} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px',
                  background: idx === 0
                    ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
                    : 'var(--bg)',
                  borderRadius: 12,
                  boxShadow: idx === 0
                    ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)'
                    : 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: idx === 0 ? 'var(--warm-grey)' : 'var(--text-primary)', letterSpacing: '0.04em' }}>{ciudad}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: idx === 0 ? 'var(--warm-grey)' : 'var(--sage-dark)',
                    letterSpacing: '0.05em',
                  }}>
                    {cantidad} {cantidad === 1 ? 'visita' : 'visitas'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CURIOSIDADES */}
        <div style={card}>
          <h2 style={tituloSeccion}>{<><Sparkles size={14} /> Curiosidades del grupo</>}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {stats.artistaTop && (
              <CuriosidadCard
                emoji={<Mic size={20} />}
                titulo='Artista más visto'
                valor={stats.artistaTop[0]}
                detalle={stats.artistaTop[1] + ' ' + (stats.artistaTop[1] === 1 ? 'concierto' : 'conciertos')}
              />
            )}

            {stats.conciertoMasCaro && (
              <CuriosidadCard
                emoji={<Ticket size={20} />}
                titulo='Entrada más cara'
                valor={stats.conciertoMasCaro.artista}
                detalle={formatEuro(stats.conciertoMasCaro.precio) + ' · ' + (stats.conciertoMasCaro.ciudad || '')}
              />
            )}

            {stats.mesFavorito && (
              <CuriosidadCard
                emoji={<Calendar size={20} />}
                titulo='Mes favorito del grupo'
                valor={stats.mesFavorito.nombre}
                detalle={stats.mesFavorito.cantidad + ' ' + (stats.mesFavorito.cantidad === 1 ? 'concierto' : 'conciertos') + ' en este mes'}
              />
            )}

            {stats.conciertero && (
              <CuriosidadCard
                emoji={<Trophy size={20} />}
                titulo='El concertero del grupo'
                valor={stats.conciertero.nombre}
                detalle={stats.conciertero.conciertos + ' ' + (stats.conciertero.conciertos === 1 ? 'concierto' : 'conciertos') + ' a sus espaldas'}
              />
            )}

            {stats.totalConciertos === 0 && (
              <div style={{ padding: 22, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, letterSpacing: '0.04em' }}>
                Aún no hay conciertos pasados registrados.<br />
                ¡Vamos a por el primero! ♪
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function HeroCard({ icon, valor, label, isText }) {
  return (
    <div style={{
      background: 'var(--bg)', borderRadius: 18, padding: 14,
      boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sage-dark)', marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: isText ? 18 : 26,
        fontWeight: 300,
        color: 'var(--sage-dark)',
        lineHeight: 1.1,
        letterSpacing: '0.02em',
      }}>
        {valor}
      </div>
    </div>
  )
}

function CuriosidadCard({ emoji, titulo, valor, detalle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: 14,
      background: 'var(--bg)',
      borderRadius: 14,
      boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
    }}>
      <div style={{
        fontSize: 22, width: 44, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
        borderRadius: '50%',
        boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        flexShrink: 0,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em' }}>
          {titulo}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4,
          letterSpacing: '0.04em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {valor}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, letterSpacing: '0.03em' }}>{detalle}</div>
      </div>
    </div>
  )
}
