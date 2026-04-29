import { readFileSync, writeFileSync } from 'fs'

// =========================================================
// 1) ARREGLAR App.jsx — añadir conciertos={conciertos} a NuevoConcierto
// =========================================================
let appCode = readFileSync('src/App.jsx', 'utf8')

const viejoApp = `      <NuevoConcierto
        amigos={amigos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />`

const nuevoApp = `      <NuevoConcierto
        amigos={amigos}
        conciertos={conciertos}
        onGuardado={() => { setMostrarNuevo(false); cargarConciertos() }}
        onCancelar={() => setMostrarNuevo(false)}
      />`

if (appCode.includes(viejoApp)) {
  appCode = appCode.replace(viejoApp, nuevoApp)
  writeFileSync('src/App.jsx', appCode)
  console.log('✅ App.jsx: ahora pasa conciertos={conciertos} a NuevoConcierto')
} else if (appCode.includes('<NuevoConcierto') && appCode.includes('conciertos={conciertos}\n        onGuardado')) {
  console.log('ℹ️ App.jsx ya tenía el cambio aplicado')
} else {
  console.log('⚠️ No se encontró el bloque exacto. Revísalo a mano.')
}

// =========================================================
// 2) QUITAR logs de diagnóstico de NuevoConcierto.jsx
// =========================================================
let nc = readFileSync('src/components/NuevoConcierto.jsx', 'utf8')

const bloqueLogs = `  const [foco, setFoco] = useState(null)

  console.log('🔍 NuevoConcierto - props.conciertos:', conciertos)
  console.log('🔍 NuevoConcierto - tipo:', typeof conciertos, 'esArray:', Array.isArray(conciertos), 'longitud:', conciertos?.length)`

const sinLogs = `  const [foco, setFoco] = useState(null)`

if (nc.includes(bloqueLogs)) {
  nc = nc.replace(bloqueLogs, sinLogs)
  writeFileSync('src/components/NuevoConcierto.jsx', nc)
  console.log('✅ NuevoConcierto.jsx: logs de diagnóstico eliminados')
} else {
  console.log('ℹ️ Los logs ya no estaban (o tenían otro formato)')
}

console.log('\n🎸 Hecho. Recarga localhost:5173 y prueba escribir "arde" en el campo Artista')