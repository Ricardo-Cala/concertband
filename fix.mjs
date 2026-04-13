import { readFileSync, writeFileSync } from 'fs'

const aumentar = (code, de, a) => code.replaceAll(`size={${de}}`, `size={${a}}`)

// Grupo.jsx
let grupo = readFileSync('src/components/Grupo.jsx', 'utf8')
grupo = aumentar(grupo, 44, 53)
grupo = aumentar(grupo, 24, 29)
grupo = aumentar(grupo, 28, 34)
grupo = aumentar(grupo, 80, 96)
writeFileSync('src/components/Grupo.jsx', grupo)

// FichaConcierto.jsx
let ficha = readFileSync('src/components/FichaConcierto.jsx', 'utf8')
ficha = aumentar(ficha, 34, 41)
ficha = aumentar(ficha, 26, 31)
ficha = aumentar(ficha, 28, 34)
ficha = aumentar(ficha, 30, 36)
writeFileSync('src/components/FichaConcierto.jsx', ficha)

// Header.jsx
let header = readFileSync('src/components/Header.jsx', 'utf8')
header = aumentar(header, 28, 34)
header = aumentar(header, 32, 38)
writeFileSync('src/components/Header.jsx', header)

// FichaViaje.jsx
let viaje = readFileSync('src/components/FichaViaje.jsx', 'utf8')
viaje = aumentar(viaje, 32, 38)
viaje = aumentar(viaje, 28, 34)
viaje = aumentar(viaje, 20, 24)
writeFileSync('src/components/FichaViaje.jsx', viaje)

console.log('Avatares aumentados un 20%')