import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaAmigo.jsx', 'utf8')

// Localizamos el bloque del HISTORIAL por regex tolerante
const regex = /\{\/\* HISTORIAL \*\/\}\s*\{conciertos\.length > 0 && \([\s\S]*?\)\}\s*(?=\{\/\* GUSTOS MUSICALES \*\/\})/

const nuevo = `{/* HISTORIAL */}
        {conciertos.length > 0 && (() => {
          const hoy = new Date()
          hoy.setHours(0, 0, 0, 0)
          return (
            <div style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: '#888', marginBottom: 10 }}>HISTORIAL</div>
              {conciertos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(c => {
                const fechaConcierto = new Date(c.fecha)
                fechaConcierto.setHours(0, 0, 0, 0)
                const pasado = fechaConcierto < hoy
                return (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: pasado ? '#aaa' : '#333' }}>{c.artista}</span>
                    <span style={{ fontSize: 12, color: pasado ? '#bbb' : '#888' }}>{new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )
              })}
            </div>
          )
        })()}

        `

if (!regex.test(code)) {
  console.error('❌ No se encontró el bloque del HISTORIAL con regex. Aborto.')
  process.exit(1)
}

code = code.replace(regex, nuevo)
writeFileSync('src/components/FichaAmigo.jsx', code)
console.log('✅ Historial diferenciado: pasados en gris, futuros normales')