import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

// 1. Cambiar botón WhatsApp: emoji → texto, color #128C7E → sage
code = code.replace(
  /background:\s*'#128C7E'[\s\S]*?}}>📲\s*WA<\/button>/,
  `background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
    color: 'var(--warm-grey)',
    borderRadius: 12, padding: '8px 16px', fontSize: 10, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
    fontFamily: 'inherit',
  }}>WHATSAPP</button>`
)

// 2. Cambiar botón Editar: emoji ✏️ → texto EDITAR
code = code.replace(
  /}>✏️<\/button>/,
  `}>EDITAR</button>`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('✔ FichaConcierto.jsx actualizado')
console.log('  • Botón WHATSAPP: color sage, sin emoji')
console.log('  • Botón EDITAR: texto limpio, sin emoji')
