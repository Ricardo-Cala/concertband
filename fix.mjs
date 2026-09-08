import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/App.jsx'
let code = readFileSync(ruta, 'utf8')
let errores = 0

// 1) Añadir Calendar al import de lucide-react
const oldImport = `import { Home, Music2, Users } from 'lucide-react'`
const newImport = `import { Home, Music2, Users, Calendar } from 'lucide-react'`
if (!code.includes(oldImport)) { console.error('ERROR: no encontre el import de lucide-react'); errores++ }
code = code.replace(oldImport, newImport)

// 2) Reemplazar el contenido del boton de Confirmados
const oldBoton = `          <div className='card-tap' onClick={() => setMostrarCalendario(true)} style={{ ...statCard, cursor: 'pointer' }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: 'var(--sage-dark)' }}>{conciertos.filter(c => c.estado === 'confirmado').length}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Confirmados</div>
          </div>`

const newBoton = `          <div className='card-tap' onClick={() => setMostrarCalendario(true)} style={{ ...statCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Calendar size={30} strokeWidth={1.4} color='var(--sage-dark)' />
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Calendario</div>
          </div>`

if (!code.includes(oldBoton)) { console.error('ERROR: no encontre el bloque del boton Confirmados'); errores++ }
code = code.replace(oldBoton, newBoton)

if (errores > 0) {
  console.error('Abortando: ' + errores + ' bloques no encontrados')
  process.exit(1)
}

writeFileSync(ruta, code)
console.log('OK: Boton "Confirmados" reemplazado por icono Calendar + texto CALENDARIO')
