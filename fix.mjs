import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')
let cambios = 0

// 2.1) Añadir estado 'cargando' después de 'verEstadisticas'
if (!code.includes('const [cargando')) {
  const regexEstado = /(const \[verEstadisticas, setVerEstadisticas\] = useState\(false\))/
  if (regexEstado.test(code)) {
    code = code.replace(regexEstado, `$1\n  const [cargando, setCargando] = useState(true)`)
    cambios++
    console.log('✅ Estado "cargando" añadido')
  } else {
    console.error('❌ No se encontró verEstadisticas. Aborto.')
    process.exit(1)
  }
} else {
  console.log('ℹ️  Estado "cargando" ya existía')
}

// 2.2) Modificar cargarConciertos
if (!code.includes('setCargando(false)')) {
  const regexCargar = /(const cargarConciertos = async \(\) => \{[\s\S]*?if \(data\) setConciertos\(data\)\s*)\}/
  if (regexCargar.test(code)) {
    code = code.replace(regexCargar, `$1\n    setCargando(false)\n  }`)
    cambios++
    console.log('✅ cargarConciertos actualizado')
  } else {
    console.error('❌ No se encontró cargarConciertos. Aborto.')
    process.exit(1)
  }
} else {
  console.log('ℹ️  cargarConciertos ya tenía setCargando')
}

// 2.3) Añadir componentes Skeleton antes de TarjetaConcierto
if (!code.includes('SkeletonCard')) {
  const regexMarcador = /(\s*\/\/ TARJETA MEJORADA)/
  const skeletonComponente = `
  // SKELETON CARDS para estados de carga
  const SkeletonCard = () => (
    <div className='skeleton-card'>
      <div className='skeleton' style={{ height: 14, width: '60%', marginBottom: 8 }} />
      <div className='skeleton' style={{ height: 11, width: '85%', marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <div className='skeleton' style={{ height: 18, width: 70, borderRadius: 20 }} />
        <div className='skeleton' style={{ height: 18, width: 50, borderRadius: 20 }} />
      </div>
    </div>
  )

  const SkeletonProximo = () => (
    <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 4px 16px rgba(26,26,46,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div className='skeleton' style={{ height: 50, width: 56, background: 'linear-gradient(90deg, #2a2a3e 0%, #3a3a52 50%, #2a2a3e 100%)', backgroundSize: '800px 100%' }} />
        <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 16 }}>
          <div className='skeleton' style={{ height: 11, width: '50%', marginBottom: 6, background: 'linear-gradient(90deg, #2a2a3e 0%, #3a3a52 50%, #2a2a3e 100%)', backgroundSize: '800px 100%' }} />
          <div className='skeleton' style={{ height: 14, width: '70%', marginBottom: 4, background: 'linear-gradient(90deg, #2a2a3e 0%, #3a3a52 50%, #2a2a3e 100%)', backgroundSize: '800px 100%' }} />
          <div className='skeleton' style={{ height: 10, width: '55%', background: 'linear-gradient(90deg, #2a2a3e 0%, #3a3a52 50%, #2a2a3e 100%)', backgroundSize: '800px 100%' }} />
        </div>
      </div>
    </div>
  )
$1`
  if (regexMarcador.test(code)) {
    code = code.replace(regexMarcador, skeletonComponente)
    cambios++
    console.log('✅ Componentes Skeleton añadidos')
  } else {
    console.error('❌ No se encontró el marcador "// TARJETA MEJORADA". Aborto.')
    process.exit(1)
  }
} else {
  console.log('ℹ️  Skeletons ya existían')
}

// 2.4) Reemplazar próximos en PantallaInicio
const regexInicio = /\{proximos\.slice\(0, 3\)\.map\(c => <TarjetaConcierto key=\{c\.id\} c=\{c\} \/>\)\}/
if (regexInicio.test(code) && !code.includes('cargando\n          ? Array.from')) {
  code = code.replace(regexInicio, `{cargando
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : proximos.slice(0, 3).map(c => <TarjetaConcierto key={c.id} c={c} />)
        }`)
  cambios++
  console.log('✅ PantallaInicio: skeletons en próximos conciertos')
} else {
  console.log('ℹ️  Skeleton de próximos ya aplicado')
}

// 2.5) Añadir SkeletonProximo antes de la tarjeta oscura
if (!code.includes('cargando && <SkeletonProximo')) {
  const regexProximo = /(\{siguiente && \()/
  if (regexProximo.test(code)) {
    code = code.replace(regexProximo, `{cargando && <SkeletonProximo />}\n        {!cargando && siguiente && (`)
    // Quitar el {siguiente && ( original que quedaría duplicado al final
    code = code.replace(/\{!cargando && siguiente && \(\s*\{siguiente && \(/, `{!cargando && siguiente && (`)
    cambios++
    console.log('✅ Tarjeta PRÓXIMO CONCIERTO: skeleton aplicado')
  } else {
    console.log('⚠️  No se encontró {siguiente && (')
  }
} else {
  console.log('ℹ️  Skeleton de PRÓXIMO ya aplicado')
}

// 2.6) PantallaConciertos
const regexConciertos = /\{proximos\.length > 0 && \(\s*<>\s*<div style=\{\{ fontSize: 11, color: '#7F77DD', fontWeight: 500, marginBottom: 8 \}\}>PRÓXIMOS<\/div>\s*\{proximos\.map\(c => <TarjetaConcierto key=\{c\.id\} c=\{c\} \/>\)\}\s*<\/>\s*\)\}/
if (regexConciertos.test(code) && !code.includes('cargando && (\n        <>\n          <div style={{ fontSize: 11, color: \'#7F77DD\'')) {
  code = code.replace(regexConciertos, `{cargando && (
        <>
          <div style={{ fontSize: 11, color: '#7F77DD', fontWeight: 500, marginBottom: 8 }}>PRÓXIMOS</div>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </>
      )}
      {!cargando && proximos.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#7F77DD', fontWeight: 500, marginBottom: 8 }}>PRÓXIMOS</div>
          {proximos.map(c => <TarjetaConcierto key={c.id} c={c} />)}
        </>
      )}`)
  cambios++
  console.log('✅ PantallaConciertos: skeletons aplicados')
} else {
  console.log('ℹ️  Skeleton de PantallaConciertos ya aplicado o no encontrado')
}

writeFileSync('src/App.jsx', code)
console.log(`\n✅ Total: ${cambios} cambios aplicados`)