import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `                                📎 Subir`,
  `                                📎 Subir entradas`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Botón actualizado')