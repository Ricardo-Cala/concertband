import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')

code = code.replace(
  `            <input type='text' value={f.anio} onChange={e => setF(x => ({ ...x, anio: e.target.value.replace(/\\D/g,'').slice(0,4) }))}
              placeholder='Año' inputMode='numeric'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />`,
  `            <input
              type='text'
              value={f.anio}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g, '')
                if (v.length <= 4) setF(x => ({ ...x, anio: v }))
              }}
              placeholder='Año'
              inputMode='numeric'
              maxLength={4}
              autoComplete='off'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />`
)

writeFileSync('src/components/Grupo.jsx', code)
console.log('Campo año corregido sin restriccion de foco')