import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
const original = readFileSync(ruta, 'utf8')
const crlf = original.includes('\r\n')
let code = original.replace(/\r\n/g, '\n')

// Cambiar aviso: si hay hora -> 1h antes; si es todo el dia -> 1 dia antes
const viejo = `'DESCRIPTION:' + esc(titulo),
      'TRIGGER:-P1D',`
const nuevo = `'DESCRIPTION:' + esc(titulo),
      hora ? 'TRIGGER:-PT1H' : 'TRIGGER:-P1D',`

if (!code.includes(viejo)) {
  console.error('ERROR: no encuentro el bloque TRIGGER - no se ha modificado nada')
  process.exit(1)
}

code = code.replace(viejo, nuevo)
writeFileSync(ruta, crlf ? code.replace(/\n/g, '\r\n') : code)
console.log('Hecho: aviso 1h antes si hay hora, 1 dia antes si es todo el dia')
