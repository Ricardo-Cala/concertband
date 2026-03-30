import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `    if (gasto) {
      await supabase.from('pagos').insert(formGasto.receptores.map(amigoId => ({
        gasto_id: gasto.id,
        pagador_id: amigoId,
        cantidad: parseFloat(formGasto.precio_entrada),
        pagado: false,
      })))
    }`,
  `    if (gasto) {
      const todosReceptores = [
        { amigoId: formGasto.comprador_id, pagado: true },
        ...formGasto.receptores.map(amigoId => ({ amigoId, pagado: false }))
      ]
      await supabase.from('pagos').insert(todosReceptores.map(r => ({
        gasto_id: gasto.id,
        pagador_id: r.amigoId,
        cantidad: parseFloat(formGasto.precio_entrada),
        pagado: r.pagado,
      })))
    }`
)

code = code.replace(
  `  const amigosParaSeleccionar = amigos.filter(a => a.id !== formGasto.comprador_id)`,
  `  const amigosParaSeleccionar = amigos`
)

code = code.replace(
  `                      {amigosParaSeleccionar.map(a => {
                        const seleccionado = formGasto.receptores.includes(a.id)
                        return (
                          <div key={a.id} onClick={() => toggleReceptor(a.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                            background: seleccionado ? '#EEEDFE' : '#f8f8f8',
                            border: seleccionado ? '1px solid #AFA9EC' : '1px solid #eee',
                          }}>
                            <Avatar amigo={a} size={28} />
                            <span style={{ fontSize: 13, flex: 1, fontWeight: seleccionado ? 500 : 400, color: seleccionado ? '#3C3489' : 'var(--color-text-primary)' }}>{a.nombre}</span>
                            <span style={{ fontSize: 16, color: seleccionado ? '#7F77DD' : '#ddd' }}>{seleccionado ? '✓' : '○'}</span>
                          </div>
                        )
                      })}`,
  `                      {amigosParaSeleccionar.map(a => {
                        const esComprador = a.id === formGasto.comprador_id
                        const seleccionado = esComprador || formGasto.receptores.includes(a.id)
                        return (
                          <div key={a.id} onClick={() => !esComprador && toggleReceptor(a.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', borderRadius: 10, cursor: esComprador ? 'default' : 'pointer',
                            background: esComprador ? '#EAF3DE' : seleccionado ? '#EEEDFE' : '#f8f8f8',
                            border: esComprador ? '1px solid #C0DD97' : seleccionado ? '1px solid #AFA9EC' : '1px solid #eee',
                          }}>
                            <Avatar amigo={a} size={28} />
                            <span style={{ fontSize: 13, flex: 1, fontWeight: 500, color: esComprador ? '#27500A' : seleccionado ? '#3C3489' : 'var(--color-text-primary)' }}>{a.nombre}</span>
                            {esComprador
                              ? <span style={{ fontSize: 11, color: '#27500A', fontWeight: 500 }}>comprador ✓</span>
                              : <span style={{ fontSize: 16, color: seleccionado ? '#7F77DD' : '#ddd' }}>{seleccionado ? '✓' : '○'}</span>
                            }
                          </div>
                        )
                      })}`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Comprador marcado como pagado automaticamente')