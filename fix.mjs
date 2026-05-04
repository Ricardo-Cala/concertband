import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

// 1) Cambiar el cálculo de diasRestantes para normalizar a medianoche y usar floor
code = code.replace(
  `const diasRestantes = siguiente ? Math.ceil((new Date(siguiente.fecha) - hoy) / (1000 * 60 * 60 * 24)) : null`,
  `const diasRestantes = siguiente ? (() => {
    const fechaConcierto = new Date(siguiente.fecha)
    fechaConcierto.setHours(0, 0, 0, 0)
    const hoyNorm = new Date()
    hoyNorm.setHours(0, 0, 0, 0)
    return Math.round((fechaConcierto - hoyNorm) / (1000 * 60 * 60 * 24))
  })() : null`
)

// 2) Actualizar el texto singular/plural para incluir "hoy" cuando son 0 días
code = code.replace(
  `{diasRestantes === 1 ? 'día' : 'días'}`,
  `{diasRestantes === 0 ? '¡HOY!' : diasRestantes === 1 ? 'día' : 'días'}`
)

writeFileSync('src/App.jsx', code)
console.log('✅ Cálculo de días restantes corregido')