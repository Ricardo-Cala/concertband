import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')

code = code.replace(
  `            <input type='number' value={f.anio} onChange={e => setF(x => ({ ...x, anio: e.target.value }))}
              placeholder='Año' min='1920' max='2010'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />`,
  `            <input type='text' value={f.anio} onChange={e => setF(x => ({ ...x, anio: e.target.value.replace(/\\D/g,'').slice(0,4) }))}
              placeholder='Año' inputMode='numeric'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />`
)

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

code = code.replace(
  `          {f.dia && f.mes && <div style={{ fontSize: 12, color: '#888' }}>🎂 {f.dia} de ${meses}[parseInt(f.mes)-1] {f.anio && \`de \${f.anio}\`}</div>}`,
  `          {f.dia && f.mes && <div style={{ fontSize: 12, color: '#888' }}>🎂 {f.dia} de {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][parseInt(f.mes)-1]} {f.anio && \`de \${f.anio}\`}</div>}`
)

writeFileSync('src/components/Grupo.jsx', code)
console.log('Campo año corregido')