import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

let cambios = 0

// 1) TarjetaConcierto: añadir className al primer <div onClick={() => setConciertoSeleccionado(c)}
const regex1 = /(const TarjetaConcierto = \(\{ c, opacidad = 1 \}\) => \(\s*<div )(onClick=\{\(\) => setConciertoSeleccionado\(c\)\})/
if (regex1.test(code)) {
  code = code.replace(regex1, `$1className='fade-in-up' $2`)
  cambios++
  console.log('✅ TarjetaConcierto actualizada')
} else {
  console.log('⚠️  No se encontró TarjetaConcierto')
}

// 2) Tarjeta oscura PRÓXIMO CONCIERTO: <div style={{ background: '#1a1a2e', ...
const regex2 = /(<div )(style=\{\{ background: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 16, cursor: 'pointer')/
if (regex2.test(code)) {
  code = code.replace(regex2, `$1className='fade-in-up' $2`)
  cambios++
  console.log('✅ Tarjeta PRÓXIMO CONCIERTO actualizada')
} else {
  console.log('⚠️  No se encontró tarjeta PRÓXIMO CONCIERTO')
}

writeFileSync('src/App.jsx', code)
console.log(`✅ ${cambios}/2 bloques actualizados`)