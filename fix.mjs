import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

code = code.replace(
  `            <span style={tagEstado(c.estado)}>{c.estado}</span>`,
  `            <span style={tagEstado(c.estado)}>{c.estado}</span>
            {c.hora_apertura && (
              <span style={{ background: '#E1EAF5', color: '#1A3A5C', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
                🕐 {c.hora_apertura.slice(0,5)}h
              </span>
            )}`
)

writeFileSync('src/App.jsx', code)
console.log('Hora de apertura añadida a tarjetas')