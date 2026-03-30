import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto.id,
      comprador_id: formGasto.comprador_id,
      precio_entrada: parseFloat(formGasto.precio_entrada),
      cantidad: formGasto.receptores.length,
    }]).select().single()`,
  `    const totalPersonas = formGasto.receptores.length + 1
    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto.id,
      comprador_id: formGasto.comprador_id,
      precio_entrada: parseFloat(formGasto.precio_entrada),
      cantidad: totalPersonas,
    }]).select().single()`
)

code = code.replace(
  /<div style=\{\{ fontSize: 12, color: '#888' \}\}>\{g\.cantidad\} entrada\{g\.cantidad > 1 \? 's' : ''\} · \{g\.precio_entrada\}€ c\/u · <span style=\{\{ fontWeight: 500, color: '#534AB7' \}\}>\{(g\.precio_entrada \* g\.cantidad)\.toFixed\(0\)\}€ total<\/span><\/div>/,
  `<div style={{ fontSize: 12, color: '#888' }}>{g.cantidad} entrada{g.cantidad > 1 ? 's' : ''} · {Number(g.precio_entrada).toFixed(2)}€ c/u · <span style={{ fontWeight: 500, color: '#534AB7' }}>{(g.precio_entrada * g.cantidad).toFixed(2)}€ total</span></div>`
)

code = code.replace(
  `              <span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{p.cantidad}€</span>`,
  `              <span style={{ fontSize: 12, color: '#E24B4A', fontWeight: 500 }}>{Number(p.cantidad).toFixed(2)}€</span>`
)

code = code.replace(
  `              <span style={{ fontSize: 12, color: '#3B6D11', fontWeight: 500 }}>{p.cantidad}€</span>`,
  `              <span style={{ fontSize: 12, color: '#3B6D11', fontWeight: 500 }}>{Number(p.cantidad).toFixed(2)}€</span>`
)

code = code.replace(
  `  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + p.cantidad, 0)
  const totalCobrado = pagos.filter(p => p.pagado).reduce((s, p) => s + p.cantidad, 0)`,
  `  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + Number(p.cantidad), 0)
  const totalCobrado = pagos.filter(p => p.pagado && p.pagador_id !== gastos.find(g => g.id === p.gasto_id)?.comprador_id).reduce((s, p) => s + Number(p.cantidad), 0)`
)

code = code.replace(
  `                <div style={{ fontSize: 20, fontWeight: 500, color: '#791F1F' }}>{totalPendiente.toFixed(0)}€</div>`,
  `                <div style={{ fontSize: 20, fontWeight: 500, color: '#791F1F' }}>{totalPendiente.toFixed(2)}€</div>`
)

code = code.replace(
  `                <div style={{ fontSize: 20, fontWeight: 500, color: '#27500A' }}>{totalCobrado.toFixed(0)}€</div>`,
  `                <div style={{ fontSize: 20, fontWeight: 500, color: '#27500A' }}>{totalCobrado.toFixed(2)}€</div>`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Cantidades y totales corregidos')