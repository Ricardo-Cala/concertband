import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')
let cambios = 0

// 1) Añadir CSS de la animación de spin a App.css
let css = readFileSync('src/App.css', 'utf8')
const cssSpin = `
/* === SPINNER PULL TO REFRESH === */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spin {
  animation: spin 0.8s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .spin { animation: none; }
}
`
if (!css.includes('=== SPINNER PULL TO REFRESH')) {
  css += cssSpin
  writeFileSync('src/App.css', css)
  console.log('✅ CSS de spinner añadido')
} else {
  console.log('ℹ️  CSS de spinner ya existía')
}

// 2) Añadir estados pullDistance y refrescando
if (!code.includes('const [pullDistance')) {
  const regexEstado = /(const \[cargando, setCargando\] = useState\(true\))/
  if (regexEstado.test(code)) {
    code = code.replace(regexEstado, `$1\n  const [pullDistance, setPullDistance] = useState(0)\n  const [refrescando, setRefrescando] = useState(false)`)
    cambios++
    console.log('✅ Estados pullDistance y refrescando añadidos')
  } else {
    console.error('❌ No se encontró estado cargando. Aborto.')
    process.exit(1)
  }
} else {
  console.log('ℹ️  Estados ya existían')
}

// 3) Reemplazar el useEffect del pull-to-refresh con uno que actualice los estados
const regexPullViejo = /  useEffect\(\(\) => \{\s*let startY = 0\s*let pulling = false\s*\n[\s\S]*?return \(\) => \{\s*document\.removeEventListener\('touchstart', onTouchStart\)\s*document\.removeEventListener\('touchend', onTouchEnd\)\s*\}\s*\}, \[\]\)/

const pullNuevo = `  useEffect(() => {
    let startY = 0
    let pulling = false
    let currentDistance = 0

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY
      pulling = window.scrollY === 0
    }

    const onTouchMove = (e) => {
      if (!pulling) return
      const diff = e.touches[0].clientY - startY
      if (diff > 0 && diff < 150) {
        currentDistance = diff
        setPullDistance(diff)
      }
    }

    const onTouchEnd = async (e) => {
      if (!pulling) return
      const diff = e.changedTouches[0].clientY - startY
      setPullDistance(0)
      if (diff > 80) {
        setRefrescando(true)
        await cargarConciertos()
        await supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
        await supabase.from('asistentes').select('*').then(({ data }) => data && setAsistentes(data))
        await supabase.from('gastos').select('*').then(({ data }) => data && setGastos(data))
        setRefrescando(false)
      }
      pulling = false
      currentDistance = 0
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])`

if (regexPullViejo.test(code)) {
  code = code.replace(regexPullViejo, pullNuevo)
  cambios++
  console.log('✅ useEffect de pull-to-refresh actualizado')
} else if (code.includes('onTouchMove')) {
  console.log('ℹ️  Pull-to-refresh ya tiene onTouchMove')
} else {
  console.error('❌ No se encontró el useEffect de pull-to-refresh. Aborto.')
  process.exit(1)
}

// 4) Añadir el indicador visual antes del Header
const regexIndicador = /(    <div style=\{\{ maxWidth: 390, margin: '0 auto', background: '#f0f0f5', minHeight: '100vh' \}\}>\s*)<Header/

const indicadorJsx = `<div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, maxWidth: 390, width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: refrescando ? 50 : Math.min(pullDistance, 80),
        opacity: refrescando ? 1 : Math.min(pullDistance / 80, 1),
        background: 'rgba(240,240,245,0.95)',
        backdropFilter: 'blur(8px)',
        transition: refrescando ? 'height 0.2s' : 'none',
        pointerEvents: 'none',
        fontSize: 13, color: '#7F77DD', fontWeight: 500
      }}>
        {refrescando ? (
          <span><span className='spin' style={{ display: 'inline-block' }}>🔄</span> Actualizando...</span>
        ) : pullDistance > 80 ? (
          <span>↑ Suelta para refrescar</span>
        ) : pullDistance > 0 ? (
          <span style={{ display: 'inline-block', transform: \`rotate(\${Math.min(pullDistance * 2, 180)}deg)\` }}>↓</span>
        ) : null}
      </div>
      <Header`

if (!code.includes('Suelta para refrescar')) {
  if (regexIndicador.test(code)) {
    code = code.replace(regexIndicador, `$1${indicadorJsx}`)
    cambios++
    console.log('✅ Indicador visual añadido')
  } else {
    console.error('❌ No se encontró el contenedor principal. Aborto.')
    process.exit(1)
  }
} else {
  console.log('ℹ️  Indicador ya existía')
}

writeFileSync('src/App.jsx', code)
console.log(`\n✅ Total: ${cambios} cambios aplicados`)