import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
const original = readFileSync(ruta, 'utf8')
const crlf = original.includes('\r\n')
let code = original.replace(/\r\n/g, '\n')

const fallo = msg => {
  console.error('ERROR: ' + msg + ' - no se ha modificado nada')
  process.exit(1)
}

// 1. Leer la columna correcta hora_apertura (con fallback a hora por si acaso)
const vieja1 = `    let hora = concierto.hora ? String(concierto.hora).slice(0, 5) : ''`
const nueva1 = `    let hora = concierto.hora_apertura ? String(concierto.hora_apertura).slice(0, 5) : (concierto.hora ? String(concierto.hora).slice(0, 5) : '')`
if (!code.includes(vieja1)) fallo('no encuentro la lectura de hora')
code = code.replace(vieja1, nueva1)

// 2. Usar hora local flotante (sin conversion UTC manual)
const vieja2 = `    if (/^\\d{1,2}:\\d{2}/.test(hora)) {
      const hm = hora.split(':').map(Number)
      const ini = new Date(Date.UTC(y, m - 1, d, hm[0] - 2, hm[1]))
      const end = new Date(ini.getTime() + 3 * 3600 * 1000)
      inicio = 'DTSTART:' + fmtHora(ini) + 'Z'
      fin = 'DTEND:' + fmtHora(end) + 'Z'
    } else {`
const nueva2 = `    if (/^\\d{1,2}:\\d{2}/.test(hora)) {
      const hm = hora.split(':').map(Number)
      const iniL = new Date(y, m - 1, d, hm[0], hm[1])
      const finL = new Date(iniL.getTime() + 3 * 3600 * 1000)
      const fmtLocal = x => x.getFullYear() + p2(x.getMonth() + 1) + p2(x.getDate()) + 'T' + p2(x.getHours()) + p2(x.getMinutes()) + '00'
      inicio = 'DTSTART:' + fmtLocal(iniL)
      fin = 'DTEND:' + fmtLocal(finL)
    } else {`
if (!code.includes(vieja2)) fallo('no encuentro el bloque de hora UTC')
code = code.replace(vieja2, nueva2)

writeFileSync(ruta, crlf ? code.replace(/\n/g, '\r\n') : code)
console.log('Hecho: lee hora_apertura y usa hora local flotante')
