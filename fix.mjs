import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

code = code.replace(
  `const pasados = conciertos.filter(c => new Date(c.fecha) < hoy)`,
  `const pasados = conciertos.filter(c => new Date(c.fecha) < hoy).reverse()`
)

writeFileSync('src/App.jsx', code)
console.log('Pasados ordenados del más reciente al más antiguo')