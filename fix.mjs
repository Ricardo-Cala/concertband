import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

const lines = code.split('\n')
const seen = {}
const clean = lines.filter(l => {
  const match = l.match(/^import\s+(\w+)\s+from/)
  if (match) {
    if (seen[match[1]]) return false
    seen[match[1]] = true
  }
  return true
})

writeFileSync('src/components/FichaConcierto.jsx', clean.join('\n'))
console.log('Imports duplicados eliminados')