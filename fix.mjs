import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

code = code.replace(
  `        supabase.from('pagos').select('cantidad').eq('pagado', false),
      ]).then(([a, e, p]) => {
        setResumen({
          van: a.data?.length || 0,
          entradas: e.data?.reduce((s, x) => s + x.cantidad, 0) || 0,
          pendientePago: p.data?.reduce((s, x) => s + Number(x.cantidad), 0) || 0,
        })
      })`,
  `      supabase.from('gastos').select('id').eq('concierto_id', siguiente.id),
      ]).then(async ([a, e, g]) => {
        let pendientePago = 0
        if (g.data && g.data.length > 0) {
          const gastoIds = g.data.map(x => x.id)
          const { data: p } = await supabase.from('pagos').select('cantidad').in('gasto_id', gastoIds).eq('pagado', false)
          pendientePago = p?.reduce((s, x) => s + Number(x.cantidad), 0) || 0
        }
        setResumen({
          van: a.data?.length || 0,
          entradas: e.data?.reduce((s, x) => s + x.cantidad, 0) || 0,
          pendientePago,
        })
      })`
)

writeFileSync('src/App.jsx', code)
console.log('Pdte. pago filtrado por concierto')