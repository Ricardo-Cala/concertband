import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

// 1. Quitar 'entradas' del estado inicial
code = code.replace(
  "useState({ van: 0, entradas: 0, pendientePago: 0 })",
  "useState({ van: 0, pendientePago: 0 })"
)

// 2. Quitar la query de entradas del Promise.all y ajustar destructuring
code = code.replace(
  `supabase.from('asistentes').select('*').eq('concierto_id', siguiente.id).eq('confirmado', true),
        supabase.from('entradas').select('cantidad').eq('concierto_id', siguiente.id),
        supabase.from('gastos').select('id').eq('concierto_id', siguiente.id),
      ]).then(async ([a, e, g]) => {`,
  `supabase.from('asistentes').select('*').eq('concierto_id', siguiente.id).eq('confirmado', true),
        supabase.from('gastos').select('id').eq('concierto_id', siguiente.id),
      ]).then(async ([a, g]) => {`
)

// 3. Quitar entradas del setResumen
code = code.replace(
  `setResumen({
          van: a.data?.length || 0,
          entradas: e.data?.reduce((s, x) => s + x.cantidad, 0) || 0,
          pendientePago,
        })`,
  `setResumen({
          van: a.data?.length || 0,
          pendientePago,
        })`
)

// 4. Cambiar grid de 3 columnas a 2 en la card próximo concierto
// (hay que buscar el correcto — el de dentro de la card oscura)
code = code.replace(
  `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--sage-light)' }}>{resumen.van}</div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Van</div>
              </div>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--sage-light)' }}>{resumen.entradas}</div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Entradas</div>
              </div>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: resumen.pendientePago > 0 ? '#FAC775' : 'var(--sage-light)' }}>
                  {resumen.pendientePago > 0 ? resumen.pendientePago.toFixed(0) + '€' : '✓'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {resumen.pendientePago > 0 ? 'Pdte. pago' : 'Pagado'}
                </div>
              </div>
            </div>`,
  `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--sage-light)' }}>{resumen.van}</div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>Van</div>
              </div>
              <div style={{ background: 'rgba(245,239,230,0.08)', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: resumen.pendientePago > 0 ? '#FAC775' : 'var(--sage-light)' }}>
                  {resumen.pendientePago > 0 ? resumen.pendientePago.toFixed(0) + '€' : '✓'}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(245,239,230,0.5)', marginTop: 4, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {resumen.pendientePago > 0 ? 'Pdte. pago' : 'Pagado'}
                </div>
              </div>
            </div>`
)

writeFileSync('src/App.jsx', code)
console.log('✔ App.jsx — stat "Entradas" eliminada de la card próximo concierto')
