export default function handler(req, res) {
  const q = req.query || {}
  const titulo = q.titulo || 'Concierto'
  const fecha = q.fecha || ''
  const hora = q.hora || ''
  const lugar = q.lugar || ''
  const notas = q.notas || ''
  const id = q.id || String(Date.now())

  if (!/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
    res.status(400).send('Fecha no valida')
    return
  }

  const esc = s => String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')

  const p2 = n => String(n).padStart(2, '0')
  const fmtDia = d => d.getUTCFullYear() + p2(d.getUTCMonth() + 1) + p2(d.getUTCDate())
  const fmtHora = d => fmtDia(d) + 'T' + p2(d.getUTCHours()) + p2(d.getUTCMinutes()) + '00'

  const partes = fecha.slice(0, 10).split('-').map(Number)
  const y = partes[0], m = partes[1], d = partes[2]
  let inicio, fin

  if (/^\d{1,2}:\d{2}/.test(hora)) {
    const hm = hora.split(':').map(Number)
    const ini = new Date(Date.UTC(y, m - 1, d, hm[0], hm[1]))
    const end = new Date(ini.getTime() + 3 * 3600 * 1000)
    inicio = 'DTSTART:' + fmtHora(ini)
    fin = 'DTEND:' + fmtHora(end)
  } else {
    const ini = new Date(Date.UTC(y, m - 1, d))
    const end = new Date(ini.getTime() + 24 * 3600 * 1000)
    inicio = 'DTSTART;VALUE=DATE:' + fmtDia(ini)
    fin = 'DTEND;VALUE=DATE:' + fmtDia(end)
  }

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BOLOS GRUPIIII//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:' + id + '@concertband.vercel.app',
    'DTSTAMP:' + fmtHora(new Date()) + 'Z',
    inicio,
    fin,
    'SUMMARY:' + esc(titulo),
    lugar ? 'LOCATION:' + esc(lugar) : '',
    notas ? 'DESCRIPTION:' + esc(notas) : '',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:' + esc(titulo),
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean)

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="concierto.ics"')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(lineas.join('\r\n'))
}
