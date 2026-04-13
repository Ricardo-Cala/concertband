import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

// Cambiar color verde
code = code.replace(
  `background: '#25D366'`,
  `background: '#128C7E'`
)

// Buscar y reemplazar el contenido del botón compartir
const antes = code.indexOf('compartirWhatsApp')
const linea = code.substring(antes - 100, antes + 500)
console.log('Contexto del botón:', linea)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Color actualizado')