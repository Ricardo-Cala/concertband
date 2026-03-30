import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `import Toast from './Toast'`,
  `import Toast from './Toast'
import Setlist from './Setlist'`
)

code = code.replace(
  `{['asistencia', 'entradas'].map(t => (`,
  `{['asistencia', 'entradas', 'setlist'].map(t => (`
)

code = code.replace(
  `{t === 'asistencia' ? '👋 Asistencia' : '🎟 Entradas y pagos'}`,
  `{t === 'asistencia' ? '👋 Asistencia' : t === 'entradas' ? '🎟 Entradas y pagos' : '🎵 Setlist'}`
)

code = code.replace(
  `      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}`,
  `      {subtab === 'setlist' && (
        <div style={{ padding: 16 }}>
          <Setlist concierto={concierto} onActualizado={() => {}} />
        </div>
      )}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('FichaConcierto actualizado con Setlist')