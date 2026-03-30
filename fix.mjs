import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `                borderLeft: \`3px solid \${getEstado(a.id) === 'va' ? '#639922' : getEstado(a.id) === 'nova' ? '#E24B4A' : '#FAC775'}\``,
  `                background: getEstado(a.id) === 'va' ? '#EAF3DE' : getEstado(a.id) === 'nova' ? '#FCEBEB' : 'white',
                borderLeft: \`3px solid \${getEstado(a.id) === 'va' ? '#639922' : getEstado(a.id) === 'nova' ? '#E24B4A' : '#FAC775'}\``
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Color de fondo en tarjetas de asistencia')