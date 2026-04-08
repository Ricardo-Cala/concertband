import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `import Setlist from './Setlist'`,
  `import Setlist from './Setlist'
import Album from './Album'`
)

code = code.replace(
  `{['asistencia', 'entradas', 'setlist'].map(t => (`,
  `{['asistencia', 'entradas', 'setlist', 'fotos'].map(t => (`
)

code = code.replace(
  `{t === 'asistencia' ? '👋 Asistencia' : t === 'entradas' ? '🎟 Entradas' : '🎵 Setlist'}`,
  `{t === 'asistencia' ? '👋 Asistencia' : t === 'entradas' ? '🎟 Entradas' : t === 'setlist' ? '🎵 Setlist' : '📸 Fotos'}`
)

code = code.replace(
  `        {subtab === 'setlist' && (
          <Setlist concierto={concierto} onActualizado={() => {}} />
        )}`,
  `        {subtab === 'setlist' && (
          <Setlist concierto={concierto} onActualizado={() => {}} />
        )}
        {subtab === 'fotos' && (
          <Album concierto={concierto} amigos={amigos} />
        )}`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Album añadido a FichaConcierto')