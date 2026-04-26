// fix.mjs v2 — Estadísticas globales del grupo
// Versión robusta con backups, detección de duplicados y abort seguro
// Ejecutar: node fix.mjs

import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');
const COMPONENTS = path.join(SRC, 'components');
const RUTA_GRUPO = path.join(COMPONENTS, 'Grupo.jsx');
const RUTA_APP = path.join(SRC, 'App.jsx');
const RUTA_STATS = path.join(COMPONENTS, 'EstadisticasGrupo.jsx');

// Marcadores únicos para detectar si el patch ya está aplicado
const MARCADOR_GRUPO = '/* INICIO_TARJETA_STATS_v2 */';
const MARCADOR_APP_IMPORT = '/* IMPORT_STATS_v2 */';
const MARCADOR_APP_STATE = '/* STATE_STATS_v2 */';
const MARCADOR_APP_RENDER = '/* RENDER_STATS_v2 */';

// ============================================================
// VALIDACIONES PREVIAS
// ============================================================
console.log('🔍 Verificando archivos...\n');

if (!fs.existsSync(RUTA_GRUPO)) {
  console.error('❌ ERROR: No se encuentra ' + RUTA_GRUPO);
  console.error('   Asegúrate de ejecutar este script desde C:\\Users\\Ricardo\\concertband');
  process.exit(1);
}

if (!fs.existsSync(RUTA_APP)) {
  console.error('❌ ERROR: No se encuentra ' + RUTA_APP);
  process.exit(1);
}

console.log('✅ Grupo.jsx encontrado');
console.log('✅ App.jsx encontrado\n');

// ============================================================
// LEER ARCHIVOS
// ============================================================
const grupoOriginal = fs.readFileSync(RUTA_GRUPO, 'utf8');
const appOriginal = fs.readFileSync(RUTA_APP, 'utf8');

// ============================================================
// DETECCIÓN DE DUPLICADOS — Si encuentra cualquier rastro, aborta
// ============================================================
const yaAplicadoGrupo = grupoOriginal.includes(MARCADOR_GRUPO) ||
                        grupoOriginal.includes('onAbrirEstadisticas') ||
                        grupoOriginal.includes('TARJETA-ESTADISTICAS');

const yaAplicadoApp = appOriginal.includes(MARCADOR_APP_IMPORT) ||
                      appOriginal.includes('EstadisticasGrupo') ||
                      appOriginal.includes('verEstadisticas');

if (yaAplicadoGrupo || yaAplicadoApp) {
  console.error('⚠️  ABORT: Detectados rastros de un fix anterior.');
  if (yaAplicadoGrupo) console.error('   - Grupo.jsx ya tiene cambios');
  if (yaAplicadoApp) console.error('   - App.jsx ya tiene cambios');
  console.error('\n   Para empezar limpio, ejecuta:');
  console.error('   git checkout src/components/Grupo.jsx');
  console.error('   git checkout src/App.jsx');
  console.error('   del src\\components\\EstadisticasGrupo.jsx');
  process.exit(1);
}

console.log('✅ No hay rastros de fix anterior. Procedo.\n');

// ============================================================
// CREAR BACKUPS
// ============================================================
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupGrupo = RUTA_GRUPO + '.bak-' + timestamp;
const backupApp = RUTA_APP + '.bak-' + timestamp;

fs.writeFileSync(backupGrupo, grupoOriginal, 'utf8');
fs.writeFileSync(backupApp, appOriginal, 'utf8');

console.log('💾 Backups creados:');
console.log('   ' + path.basename(backupGrupo));
console.log('   ' + path.basename(backupApp));
console.log('');

// ============================================================
// FUNCIÓN HELPER PARA RESTAURAR EN CASO DE ERROR
// ============================================================
function abortar(motivo) {
  console.error('\n❌ ABORT: ' + motivo);
  console.error('   Los archivos NO se han modificado.');
  console.error('   Backups conservados por seguridad.');
  process.exit(1);
}

// ============================================================
// 1. PARCHEAR Grupo.jsx
// ============================================================
let grupoNuevo = grupoOriginal;

// 1.1 Añadir prop onAbrirEstadisticas a la firma del componente
const firmaRegex = /export default function Grupo\(\{\s*amigos,\s*onActualizado\s*\}\)/;
if (!firmaRegex.test(grupoNuevo)) {
  abortar('No se encontró la firma esperada de Grupo. Esperaba: export default function Grupo({ amigos, onActualizado })');
}
grupoNuevo = grupoNuevo.replace(
  firmaRegex,
  'export default function Grupo({ amigos, onActualizado, onAbrirEstadisticas })'
);

// 1.2 Insertar la tarjeta destacada justo DESPUÉS del header (div con GRUPO · N + botón Añadir)
//     y ANTES del bloque de cumpleaños próximos
//     Usamos como ancla el comentario "{proximosCumples.length > 0 && (" precedido por la cabecera
const tarjetaJSX = `
      {${MARCADOR_GRUPO}}
      <div
        onClick={onAbrirEstadisticas}
        style={{
          background: 'linear-gradient(135deg, #7F77DD 0%, #5d54b8 100%)',
          borderRadius: 14,
          padding: 14,
          marginBottom: 14,
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(127,119,221,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0
          }}>
            📊
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              Estadísticas del grupo
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
              Vuestra historia en números
            </div>
          </div>
        </div>
        <div style={{ fontSize: 24, opacity: 0.8 }}>›</div>
      </div>
`;

// Anclamos justo antes de "{proximosCumples.length > 0 && ("
const anclaCumples = '{proximosCumples.length > 0 && (';
if (!grupoNuevo.includes(anclaCumples)) {
  abortar('No se encontró el bloque de proximosCumples en Grupo.jsx');
}

// Comprobamos que aparece SOLO UNA VEZ
const apariciones = grupoNuevo.split(anclaCumples).length - 1;
if (apariciones !== 1) {
  abortar('El ancla "proximosCumples.length > 0 &&" aparece ' + apariciones + ' veces (esperaba 1)');
}

grupoNuevo = grupoNuevo.replace(
  anclaCumples,
  tarjetaJSX.trim() + '\n\n      ' + anclaCumples
);

// ============================================================
// 2. PARCHEAR App.jsx
// ============================================================
let appNuevo = appOriginal;

// 2.1 Añadir import de EstadisticasGrupo después del import de Grupo
const importGrupo = "import Grupo from './components/Grupo'";
if (!appNuevo.includes(importGrupo)) {
  abortar("No se encontró el import 'import Grupo from ./components/Grupo' en App.jsx");
}
appNuevo = appNuevo.replace(
  importGrupo,
  importGrupo + "\nimport EstadisticasGrupo from './components/EstadisticasGrupo' " + MARCADOR_APP_IMPORT
);

// 2.2 Añadir useState verEstadisticas después de mostrarNuevo
const ancStateMostrarNuevo = "const [mostrarNuevo, setMostrarNuevo] = useState(false)";
if (!appNuevo.includes(ancStateMostrarNuevo)) {
  abortar('No se encontró el useState de mostrarNuevo en App.jsx');
}
appNuevo = appNuevo.replace(
  ancStateMostrarNuevo,
  ancStateMostrarNuevo + "\n  const [verEstadisticas, setVerEstadisticas] = useState(false) " + MARCADOR_APP_STATE
);

// 2.3 Cargar gastos y asistentes (los necesitamos para las stats)
//     Lo añadimos junto a los otros estados de datos
const ancAmigosState = "const [amigos, setAmigos] = useState([])";
if (!appNuevo.includes(ancAmigosState)) {
  abortar('No se encontró el useState de amigos en App.jsx');
}
appNuevo = appNuevo.replace(
  ancAmigosState,
  ancAmigosState + "\n  const [asistentes, setAsistentes] = useState([])\n  const [gastos, setGastos] = useState([])"
);

// 2.4 Cargar asistentes y gastos en el useEffect inicial
//     Insertamos después de la primera línea del useEffect que carga amigos
const ancCargaInicial = "supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))\n    cargarConciertos()";
if (!appNuevo.includes(ancCargaInicial)) {
  abortar('No se encontró la carga inicial en App.jsx (amigos + cargarConciertos)');
}
appNuevo = appNuevo.replace(
  ancCargaInicial,
  ancCargaInicial +
  "\n    supabase.from('asistentes').select('*').then(({ data }) => data && setAsistentes(data))" +
  "\n    supabase.from('gastos').select('*').then(({ data }) => data && setGastos(data))"
);

// 2.5 Pasar prop onAbrirEstadisticas al componente Grupo
//     Buscamos el JSX exacto donde se usa <Grupo amigos={amigos} onActualizado=...
const ancGrupoJSX = '<Grupo amigos={amigos} onActualizado={() => supabase.from(\'amigos\').select(\'*\').then(({ data }) => data && setAmigos(data))} />';
if (!appNuevo.includes(ancGrupoJSX)) {
  abortar('No se encontró la línea JSX <Grupo amigos={amigos} ... /> en App.jsx');
}
appNuevo = appNuevo.replace(
  ancGrupoJSX,
  '<Grupo amigos={amigos} onActualizado={() => supabase.from(\'amigos\').select(\'*\').then(({ data }) => data && setAmigos(data))} onAbrirEstadisticas={() => setVerEstadisticas(true)} />'
);

// 2.6 Render condicional de EstadisticasGrupo justo antes del return principal
//     Estrategia: añadir un "early return" if (verEstadisticas) return <EstadisticasGrupo ... />
//     Probamos varias anclas posibles (en orden de preferencia)
const anclasEarlyReturn = [
  'if (conciertoEditando) return (',
  'if (conciertoSeleccionado) return (',
  'if (mostrarNuevo) return (',
  'const pantallas = {'
];

let anclaUsada = null;
for (const ancla of anclasEarlyReturn) {
  if (appNuevo.includes(ancla)) {
    anclaUsada = ancla;
    break;
  }
}

if (!anclaUsada) {
  abortar('No se encontró ninguna ancla válida para insertar el early-return en App.jsx');
}

const renderStats = `${MARCADOR_APP_RENDER}
  if (verEstadisticas) return (
    <EstadisticasGrupo
      conciertos={conciertos}
      amigos={amigos}
      asistentes={asistentes}
      gastos={gastos}
      onBack={() => setVerEstadisticas(false)}
    />
  )

  `;

appNuevo = appNuevo.replace(
  anclaUsada,
  renderStats + anclaUsada
);

// ============================================================
// 3. CREAR EstadisticasGrupo.jsx (siempre, sobreescribe si existe)
// ============================================================
const estadisticasGrupo = `import { useMemo } from 'react'
import { ArrowLeft, TrendingUp, MapPin, Euro, Calendar, Music2, Trophy } from 'lucide-react'
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

    // Conciertos por año
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

    // Año más activo
    let anoMasActivo = null
    let maxConciertosAno = 0
    Object.entries(porAno).forEach(([ano, cant]) => {
      if (cant > maxConciertosAno) {
        maxConciertosAno = cant
        anoMasActivo = ano
      }
    })

    // Ranking de asistencia
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

    // Top ciudades
    const ciudadesCount = {}
    conciertosPasados.forEach(c => {
      if (c.ciudad) ciudadesCount[c.ciudad] = (ciudadesCount[c.ciudad] || 0) + 1
    })
    const topCiudades = Object.entries(ciudadesCount)
      .map(([ciudad, cant]) => ({ ciudad, cantidad: cant }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8)

    // Artista top
    const artistasCount = {}
    conciertosPasados.forEach(c => {
      if (c.artista) artistasCount[c.artista] = (artistasCount[c.artista] || 0) + 1
    })
    const artistaTop = Object.entries(artistasCount).sort((a, b) => b[1] - a[1])[0]

    // Concierto más caro
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

    // Mes favorito
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

  const cardStyle = {
    background: 'white', borderRadius: 14, padding: 16,
    marginBottom: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    border: '1px solid rgba(0,0,0,0.04)'
  }
  const tituloSeccion = {
    margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#1a1a2e'
  }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: '#f0f0f5', minHeight: '100vh', paddingBottom: 30 }}>

      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #7F77DD 0%, #5d54b8 100%)',
        padding: '16px',
        color: 'white',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer'
          }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>📊 Estadísticas</h1>
            <p style={{ margin: '2px 0 0', fontSize: 12, opacity: 0.9 }}>Vuestra historia en números</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 16 }}>

        {/* HERO STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <HeroCard icon={<Music2 size={16} />} valor={stats.totalConciertos} label='Conciertos' color='#7F77DD' />
          <HeroCard icon={<MapPin size={16} />} valor={stats.totalCiudades} label='Ciudades' color='#27500A' />
          <HeroCard icon={<Euro size={16} />} valor={formatEuro(stats.totalInvertido)} label='Invertido' color='#791F1F' isText />
          <HeroCard icon={<Calendar size={16} />} valor={stats.anoMasActivo || '—'} label={stats.anoMasActivo ? stats.maxConciertosAno + ' conciertos' : 'Sin datos'} color='#1a1a2e' isText />
        </div>

        {/* GRÁFICA POR AÑO */}
        {stats.datosPorAno.length > 0 && (
          <div style={cardStyle}>
            <h2 style={tituloSeccion}>
              <TrendingUp size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Conciertos por año
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, padding: '8px 0', gap: 8 }}>
              {stats.datosPorAno.map(({ ano, cantidad }) => {
                const altura = stats.maxAno > 0 ? (cantidad / stats.maxAno) * 100 : 0
                return (
                  <div key={ano} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#7F77DD', textAlign: 'center', marginBottom: 4 }}>
                        {cantidad}
                      </div>
                      <div style={{
                        background: 'linear-gradient(180deg, #7F77DD 0%, #5d54b8 100%)',
                        height: altura + '%',
                        minHeight: cantidad > 0 ? 8 : 2,
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.6s ease',
                        boxShadow: '0 2px 4px rgba(127,119,221,0.3)'
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 6, fontWeight: 500 }}>{ano}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RANKING */}
        {stats.ranking.length > 0 && (
          <div style={cardStyle}>
            <h2 style={tituloSeccion}>
              <Trophy size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Ranking de asistencia
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats.ranking.map((amigo, idx) => {
                const porcentaje = stats.maxRanking > 0 ? (amigo.conciertos / stats.maxRanking) * 100 : 0
                const medalla = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null
                return (
                  <div key={amigo.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, textAlign: 'center', fontSize: 15 }}>
                      {medalla || <span style={{ color: '#999', fontSize: 12, fontWeight: 600 }}>{idx + 1}</span>}
                    </div>
                    <Avatar amigo={amigo} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 4 }}>{amigo.nombre}</div>
                      <div style={{ height: 7, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: porcentaje + '%',
                          background: amigo.color || '#7F77DD',
                          borderRadius: 4,
                          transition: 'width 0.6s ease'
                        }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#7F77DD', minWidth: 24, textAlign: 'right' }}>
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
          <div style={cardStyle}>
            <h2 style={tituloSeccion}>
              <MapPin size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Ciudades visitadas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stats.topCiudades.map(({ ciudad, cantidad }, idx) => (
                <div key={ciudad} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: idx === 0 ? '#EAF3DE' : '#f8f8fb',
                  borderRadius: 8,
                  border: idx === 0 ? '1px solid rgba(39,80,10,0.2)' : '1px solid #eee'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15 }}>📍</span>
                    <span style={{ fontSize: 13, fontWeight: idx === 0 ? 600 : 500, color: '#333' }}>{ciudad}</span>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: idx === 0 ? '#27500A' : '#7F77DD',
                    background: idx === 0 ? 'rgba(39,80,10,0.13)' : 'rgba(127,119,221,0.13)',
                    padding: '2px 10px', borderRadius: 12
                  }}>
                    {cantidad} {cantidad === 1 ? 'visita' : 'visitas'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CURIOSIDADES */}
        <div style={cardStyle}>
          <h2 style={tituloSeccion}>✨ Curiosidades del grupo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {stats.artistaTop && (
              <CuriosidadCard
                emoji='🎤'
                titulo='Artista más visto'
                valor={stats.artistaTop[0]}
                detalle={stats.artistaTop[1] + ' ' + (stats.artistaTop[1] === 1 ? 'concierto' : 'conciertos')}
              />
            )}

            {stats.conciertoMasCaro && (
              <CuriosidadCard
                emoji='🎟'
                titulo='Entrada más cara'
                valor={stats.conciertoMasCaro.artista}
                detalle={formatEuro(stats.conciertoMasCaro.precio) + ' · ' + (stats.conciertoMasCaro.ciudad || '')}
              />
            )}

            {stats.mesFavorito && (
              <CuriosidadCard
                emoji='📅'
                titulo='Mes favorito del grupo'
                valor={stats.mesFavorito.nombre}
                detalle={stats.mesFavorito.cantidad + ' ' + (stats.mesFavorito.cantidad === 1 ? 'concierto' : 'conciertos') + ' en este mes'}
              />
            )}

            {stats.conciertero && (
              <CuriosidadCard
                emoji='🏆'
                titulo='El concertero del grupo'
                valor={stats.conciertero.nombre}
                detalle={stats.conciertero.conciertos + ' ' + (stats.conciertero.conciertos === 1 ? 'concierto' : 'conciertos') + ' a sus espaldas'}
              />
            )}

            {stats.totalConciertos === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>
                Aún no hay conciertos pasados registrados.<br />
                ¡Vamos a por el primero! 🎸
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

function HeroCard({ icon, valor, label, color, isText }) {
  return (
    <div style={{
      background: 'white', borderRadius: 12, padding: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      border: '1px solid rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: isText ? 18 : 24,
        fontWeight: 700,
        color: '#1a1a2e',
        lineHeight: 1.1
      }}>
        {valor}
      </div>
    </div>
  )
}

function CuriosidadCard({ emoji, titulo, valor, detalle }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 12, background: '#f8f8fb',
      borderRadius: 10, border: '1px solid #eee'
    }}>
      <div style={{
        fontSize: 24, width: 42, height: 42,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'white', borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        flexShrink: 0
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {titulo}
        </div>
        <div style={{
          fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {valor}
        </div>
        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{detalle}</div>
      </div>
    </div>
  )
}
`;

// ============================================================
// VALIDACIONES FINALES — Comprobar que las inserciones fueron correctas
// ============================================================
const checks = [
  { archivo: 'Grupo.jsx',          test: grupoNuevo.includes(MARCADOR_GRUPO),       msg: 'Marcador de tarjeta no insertado' },
  { archivo: 'Grupo.jsx',          test: grupoNuevo.includes('onAbrirEstadisticas'),msg: 'Prop onAbrirEstadisticas no añadida' },
  { archivo: 'App.jsx',            test: appNuevo.includes(MARCADOR_APP_IMPORT),    msg: 'Import de EstadisticasGrupo no insertado' },
  { archivo: 'App.jsx',            test: appNuevo.includes(MARCADOR_APP_STATE),     msg: 'Estado verEstadisticas no insertado' },
  { archivo: 'App.jsx',            test: appNuevo.includes(MARCADOR_APP_RENDER),    msg: 'Render condicional no insertado' },
  { archivo: 'App.jsx',            test: appNuevo.includes('asistentes'),           msg: 'Estado asistentes no insertado' },
  { archivo: 'App.jsx',            test: appNuevo.includes('setGastos'),            msg: 'Estado gastos no insertado' },
];

const fallos = checks.filter(c => !c.test);
if (fallos.length > 0) {
  console.error('❌ Validación final fallida:');
  fallos.forEach(f => console.error('   - [' + f.archivo + '] ' + f.msg));
  abortar('Algún parche no se aplicó correctamente. Archivos NO modificados en disco.');
}

// Comprobar que NO hay duplicados accidentales tras el patch
const dupChecks = [
  { texto: 'onAbrirEstadisticas', max: 3, archivo: 'Grupo.jsx', contenido: grupoNuevo },  // firma + uso interno
  { texto: 'EstadisticasGrupo',   max: 3, archivo: 'App.jsx',   contenido: appNuevo },    // import + render
  { texto: 'verEstadisticas',     max: 5, archivo: 'App.jsx',   contenido: appNuevo },    // state + render + setter
  { texto: 'setFichaAmigo',       max: 5, archivo: 'Grupo.jsx', contenido: grupoNuevo },  // este es el que duplicó la última vez
];

for (const dc of dupChecks) {
  const count = dc.contenido.split(dc.texto).length - 1;
  if (count > dc.max) {
    abortar('Detectados ' + count + ' usos de "' + dc.texto + '" en ' + dc.archivo + ' (máximo permitido: ' + dc.max + '). Posible duplicación.');
  }
}

console.log('✅ Validaciones finales OK\n');

// ============================================================
// ESCRIBIR ARCHIVOS
// ============================================================
fs.writeFileSync(RUTA_GRUPO, grupoNuevo, 'utf8');
console.log('✅ Modificado: src/components/Grupo.jsx');

fs.writeFileSync(RUTA_APP, appNuevo, 'utf8');
console.log('✅ Modificado: src/App.jsx');

fs.writeFileSync(RUTA_STATS, estadisticasGrupo, 'utf8');
console.log('✅ Creado:     src/components/EstadisticasGrupo.jsx');

console.log('\n🎉 ¡Patch aplicado correctamente!\n');
console.log('📋 Siguiente paso:');
console.log('   npm run dev');
console.log('\n   Si todo va bien:');
console.log('   git add .');
console.log('   git commit -m "Estadisticas globales del grupo"');
console.log('   git push');
console.log('\n💾 Backups de seguridad guardados:');
console.log('   ' + path.basename(backupGrupo));
console.log('   ' + path.basename(backupApp));
console.log('   (los puedes borrar si todo va bien)\n');
