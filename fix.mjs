import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Album.jsx', 'utf8')

code = code.replace(
  `            <button onClick={() => window.open(fotoGrande.url, '_blank')} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20,
              padding: '8px 16px', color: 'white', fontSize: 13, cursor: 'pointer'
            }}>⬇️ Descargar</button>`,
  `            <a href={fotoGrande.url} download target='_blank' style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20,
              padding: '8px 16px', color: 'white', fontSize: 13, cursor: 'pointer',
              textDecoration: 'none'
            }}>⬇️ Descargar</a>`
)

writeFileSync('src/components/Album.jsx', code)
console.log('Botón descargar corregido')