import { readFileSync, writeFileSync } from 'fs'

// 1) Añadir CSS de feedback táctil al final de App.css
let css = readFileSync('src/App.css', 'utf8')

const cssTap = `
/* === FEEDBACK TÁCTIL EN BOTONES Y ELEMENTOS CLICABLES === */

.btn-tap {
  transition: transform 0.1s ease-out, opacity 0.1s ease-out, box-shadow 0.15s ease-out;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.btn-tap:active {
  transform: scale(0.96);
  opacity: 0.85;
}

/* Variante para tarjetas (efecto más sutil) */
.card-tap {
  transition: transform 0.12s ease-out, box-shadow 0.15s ease-out;
  -webkit-tap-highlight-color: transparent;
}

.card-tap:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important;
}

@media (prefers-reduced-motion: reduce) {
  .btn-tap:active,
  .card-tap:active {
    transform: none;
  }
}
`

if (!css.includes('=== FEEDBACK TÁCTIL')) {
  css += cssTap
  writeFileSync('src/App.css', css)
  console.log('✅ CSS de feedback táctil añadido a App.css')
} else {
  console.log('ℹ️  CSS de feedback táctil ya existía')
}

// 2) Aplicar clases en App.jsx
let code = readFileSync('src/App.jsx', 'utf8')
let cambios = 0

// 2.1) TarjetaConcierto → añadir 'card-tap' al className existente
const regex1 = /(const TarjetaConcierto = \(\{ c, opacidad = 1 \}\) => \(\s*<div className=')fade-in-up'/
if (regex1.test(code)) {
  code = code.replace(regex1, `$1fade-in-up card-tap'`)
  cambios++
  console.log('✅ TarjetaConcierto: card-tap añadido')
} else {
  console.log('⚠️  TarjetaConcierto: no se pudo añadir card-tap')
}

// 2.2) Tarjeta oscura PRÓXIMO CONCIERTO → añadir 'card-tap'
const regex2 = /(<div className=')fade-in-up'( style=\{\{ background: '#1a1a2e')/
if (regex2.test(code)) {
  code = code.replace(regex2, `$1fade-in-up card-tap'$2`)
  cambios++
  console.log('✅ Tarjeta PRÓXIMO CONCIERTO: card-tap añadido')
} else {
  console.log('⚠️  Tarjeta PRÓXIMO CONCIERTO: no se pudo añadir card-tap')
}

// 2.3) Botón "+ Nuevo" en cabecera de Conciertos
const regex3 = /(<button onClick=\{\(\) => setMostrarNuevo\(true\)\} )(style=\{\{ background: '#7F77DD', color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px')/
if (regex3.test(code)) {
  code = code.replace(regex3, `$1className='btn-tap' $2`)
  cambios++
  console.log('✅ Botón "+ Nuevo" actualizado')
} else {
  console.log('⚠️  Botón "+ Nuevo" no encontrado')
}

// 2.4) Tabs de navegación
const regex4 = /(<button key=\{id\} onClick=\{\(\) => setPantalla\(id\)\} )(style=\{\{)/
if (regex4.test(code)) {
  code = code.replace(regex4, `$1className='btn-tap' $2`)
  cambios++
  console.log('✅ Tabs de navegación actualizados')
} else {
  console.log('⚠️  Tabs no encontrados')
}

// 2.5) FAB flotante "+"
const regex5 = /(<button onClick=\{\(\) => setMostrarNuevo\(true\)\} )(style=\{\{\s*position: 'fixed', bottom: 24, right: 24)/
if (regex5.test(code)) {
  code = code.replace(regex5, `$1className='btn-tap' $2`)
  cambios++
  console.log('✅ FAB flotante actualizado')
} else {
  console.log('⚠️  FAB flotante no encontrado')
}

writeFileSync('src/App.jsx', code)
console.log(`\n✅ Total: ${cambios}/5 elementos actualizados`)