import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/EstadisticasGrupo.jsx', 'utf8')

// Buscar el bloque por regex (más tolerante a espacios)
const regex = /\/\/ Artista top[\s\S]*?const artistaTop = Object\.entries\(artistasCount\)\.sort\(\(a, b\) => b\[1\] - a\[1\]\)\[0\]/

const nuevo = `// Artista top (dividiendo carteles compuestos: &, +, ',' y ' Y ')
    const artistasCount = {}
    conciertosPasados.forEach(c => {
      if (!c.artista) return
      const partes = c.artista
        .split(/\\s*&\\s*|\\s*\\+\\s*|\\s*,\\s*|\\s+Y\\s+/i)
        .map(p => p.trim())
        .filter(Boolean)
      partes.forEach(nombre => {
        artistasCount[nombre] = (artistasCount[nombre] || 0) + 1
      })
    })
    const artistaTop = Object.entries(artistasCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]`

if (!regex.test(code)) {
  console.error('❌ No se encontró el bloque. Ejecuta: type src\\components\\EstadisticasGrupo.jsx | findstr /N "artistaTop"')
  process.exit(1)
}

code = code.replace(regex, nuevo)
writeFileSync('src/components/EstadisticasGrupo.jsx', code)
console.log('✅ Cálculo de artista top actualizado (divide carteles compuestos)')