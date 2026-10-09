import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
const original = readFileSync(ruta, 'utf8')
const crlf = original.includes('\r\n')
let code = original.replace(/\r\n/g, '\n')

const fallo = msg => {
  console.error('ERROR: ' + msg + ' - no se ha modificado nada')
  process.exit(1)
}

const iniF = code.indexOf('  const anadirCalendario = () => {')
if (iniF < 0) fallo('no encuentro la funcion anadirCalendario')
const finMarca = '  const setEstadoAsistencia'
const finF = code.indexOf(finMarca, iniF)
if (finF < 0) fallo('no encuentro el final de la funcion')

const nuevaFuncion = `  const anadirCalendario = () => {
    const f = String(concierto.fecha || '')
    if (!/^\\d{4}-\\d{2}-\\d{2}/.test(f)) {
      mostrarToast('Fecha del concierto no valida', 'error')
      return
    }
    let hora = concierto.hora ? String(concierto.hora).slice(0, 5) : ''
    if (!hora && f.length > 10) {
      const h = f.slice(11, 16)
      if (h && h !== '00:00') hora = h
    }
    const lugar = [concierto.recinto, concierto.ciudad].filter(Boolean).join(', ')
    const titulo = concierto.artista || 'Concierto'
    const notas = 'Concierto con BOLOS GRUPIIII - concertband.vercel.app'

    const esc = s => String(s).replace(/\\\\/g, '\\\\\\\\').replace(/;/g, '\\\\;').replace(/,/g, '\\\\,').replace(/\\r?\\n/g, '\\\\n')
    const p2 = n => String(n).padStart(2, '0')
    const fmtDia = d => d.getUTCFullYear() + p2(d.getUTCMonth() + 1) + p2(d.getUTCDate())
    const fmtHora = d => fmtDia(d) + 'T' + p2(d.getUTCHours()) + p2(d.getUTCMinutes()) + '00'

    const partes = f.slice(0, 10).split('-').map(Number)
    const y = partes[0], m = partes[1], d = partes[2]
    let inicio, fin
    if (/^\\d{1,2}:\\d{2}/.test(hora)) {
      const hm = hora.split(':').map(Number)
      const ini = new Date(Date.UTC(y, m - 1, d, hm[0] - 2, hm[1]))
      const end = new Date(ini.getTime() + 3 * 3600 * 1000)
      inicio = 'DTSTART:' + fmtHora(ini) + 'Z'
      fin = 'DTEND:' + fmtHora(end) + 'Z'
    } else {
      const ini = new Date(Date.UTC(y, m - 1, d))
      const end = new Date(ini.getTime() + 24 * 3600 * 1000)
      inicio = 'DTSTART;VALUE=DATE:' + fmtDia(ini)
      fin = 'DTEND;VALUE=DATE:' + fmtDia(end)
    }

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BOLOS GRUPIIII//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + concierto.id + '@concertband.vercel.app',
      'DTSTAMP:' + fmtHora(new Date()) + 'Z',
      inicio,
      fin,
      'SUMMARY:' + esc(titulo),
      lugar ? 'LOCATION:' + esc(lugar) : '',
      'DESCRIPTION:' + esc(notas),
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:' + esc(titulo),
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\\r\\n')

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const nombreArchivo = (titulo.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() || 'concierto') + '.ics'
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = nombreArchivo
    enlace.rel = 'noopener'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    setTimeout(() => URL.revokeObjectURL(url), 1500)
    mostrarToast('Abriendo calendario...')
  }

`

code = code.slice(0, iniF) + nuevaFuncion + code.slice(finF)

writeFileSync(ruta, crlf ? code.replace(/\n/g, '\r\n') : code)
console.log('Hecho: calendario generado en el navegador con Blob')