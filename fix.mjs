import { readFileSync, writeFileSync } from 'fs'

let ficha = readFileSync('src/components/FichaConcierto.jsx', 'utf8')
ficha = ficha.replace(
  `import { useState, useEffect } from 'react'`,
  `import { useState, useEffect } from 'react'\nimport Avatar from './Avatar'`
)
ficha = ficha.replace(/const Av = \(\{ a, size = 34 \}\) => \([\s\S]*?\)\s*\n/m, '')
ficha = ficha.replace(/<Av a=\{([^}]+)\}(\s*size=\{([^}]+)\})?\s*\/>/g, (_, a, __, size) => `<Avatar amigo={${a}}${size ? ` size={${size}}` : ''} />`)
writeFileSync('src/components/FichaConcierto.jsx', ficha)
console.log('FichaConcierto actualizado')

let header = readFileSync('src/components/Header.jsx', 'utf8')
header = header.replace(
  `export default function Header`,
  `import Avatar from './Avatar'\nexport default function Header`
)
header = header.replace(
  /<div key=\{a\.id\} style=\{\{[\s\S]*?\}\}>\{a\.iniciales\}<\/div>/g,
  `<Avatar key={a.id} amigo={a} size={28} />`
)
writeFileSync('src/components/Header.jsx', header)
console.log('Header actualizado')