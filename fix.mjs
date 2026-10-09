import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
const original = readFileSync(ruta, 'utf8')
const crlf = original.includes('\r\n')
let code = original.replace(/\r\n/g, '\n')

const viejo = "window.open('/api/ics?' + params.toString(), '_blank')"
const nuevo = "window.location.href = '/api/ics?' + params.toString()"

if (!code.includes(viejo)) {
  console.error('ERROR: no encuentro la linea - no se ha modificado nada')
  process.exit(1)
}

code = code.replace(viejo, nuevo)
writeFileSync(ruta, crlf ? code.replace(/\n/g, '\r\n') : code)
console.log('Hecho')