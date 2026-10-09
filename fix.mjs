import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
const original = readFileSync(ruta, 'utf8')
const crlf = original.includes('\r\n')
let code = original.replace(/\r\n/g, '\n')

const fallo = msg => {
  console.error('ERROR: ' + msg + ' - no se ha modificado nada')
  process.exit(1)
}

// 1. Import del icono
const impViejo = "Pencil, Trash2, Plus, X } from 'lucide-react'"
if (code.includes('CalendarPlus')) fallo('CalendarPlus ya existe en el archivo')
if (!code.includes(impViejo)) fallo('no encuentro el import de lucide-react')
code = code.replace(impViejo, "Pencil, Trash2, Plus, X, CalendarPlus } from 'lucide-react'")

// 2. Sustituir funcion compartirWhatsApp por anadirCalendario
const nuevaFuncion = `  const anadirCalendario = () => {
    const f = String(concierto.fecha || '')
    let hora = concierto.hora ? String(concierto.hora).slice(0, 5) : ''
    if (!hora && f.length > 10) {
      const h = f.slice(11, 16)
      if (h && h !== '00:00') hora = h
    }
    const lugar = [concierto.recinto, concierto.ciudad].filter(Boolean).join(', ')
    const params = new URLSearchParams({
      id: String(concierto.id),
      titulo: concierto.artista || 'Concierto',
      fecha: f.slice(0, 10),
      lugar: lugar,
      notas: 'Concierto con BOLOS GRUPIIII - concertband.vercel.app',
    })
    if (hora) params.set('hora', hora)
    window.open('/api/ics?' + params.toString(), '_blank')
  }

`
const iniF = code.indexOf('  const compartirWhatsApp = () => {')
const finF = code.indexOf('  const setEstadoAsistencia')
if (iniF < 0 || finF < 0 || finF < iniF) fallo('no encuentro la funcion compartirWhatsApp')
code = code.slice(0, iniF) + nuevaFuncion + code.slice(finF)

// 3. Sustituir boton WHATSAPP
const nuevoBoton = `<button onClick={anadirCalendario} style={{
              background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
              color: 'var(--warm-grey)', border: 'none',
              borderRadius: 12, padding: '6px 12px', fontSize: 9, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
              fontFamily: 'inherit',
            }}><CalendarPlus size={14} /><span style={{ lineHeight: 1.25, textAlign: 'left' }}>Añadir a<br />calendario</span></button>`
const iniB = code.indexOf('<button onClick={compartirWhatsApp}')
const marcaFin = '>WHATSAPP</button>'
const finB = iniB < 0 ? -1 : code.indexOf(marcaFin, iniB)
if (iniB < 0 || finB < 0) fallo('no encuentro el boton WHATSAPP')
code = code.slice(0, iniB) + nuevoBoton + code.slice(finB + marcaFin.length)

if (code.includes('compartirWhatsApp')) fallo('quedan referencias a compartirWhatsApp')

writeFileSync(ruta, crlf ? code.replace(/\n/g, '\r\n') : code)
console.log('Hecho: boton Añadir a calendario en FichaConcierto.jsx')