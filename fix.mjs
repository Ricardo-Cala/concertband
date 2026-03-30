import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

const nuevaPantallaInicio = `  const PantallaInicio = () => {
    const siguiente = proximos[0]
    const diasRestantes = siguiente ? Math.ceil((new Date(siguiente.fecha) - hoy) / (1000 * 60 * 60 * 24)) : null
    const [resumen, setResumen] = useState({ van: 0, entradas: 0, pendientePago: 0 })

    useEffect(() => {
      if (!siguiente) return
      Promise.all([
        supabase.from('asistentes').select('*').eq('concierto_id', siguiente.id).eq('confirmado', true),
        supabase.from('entradas').select('cantidad').eq('concierto_id', siguiente.id),
        supabase.from('pagos').select('cantidad').eq('pagado', false),
      ]).then(([a, e, p]) => {
        setResumen({
          van: a.data?.length || 0,
          entradas: e.data?.reduce((s, x) => s + x.cantidad, 0) || 0,
          pendientePago: p.data?.reduce((s, x) => s + Number(x.cantidad), 0) || 0,
        })
      })
    }, [siguiente?.id])

    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'white', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{conciertos.length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Conciertos totales</div>
          </div>
          <div style={{ background: 'white', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{conciertos.filter(c => c.estado === 'confirmado').length}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Confirmados</div>
          </div>
        </div>

        {siguiente && (
          <div style={{ background: '#1a1a2e', borderRadius: 14, padding: 16, marginBottom: 16, cursor: 'pointer' }}
            onClick={() => setConciertoSeleccionado(siguiente)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 42, fontWeight: 500, color: '#7F77DD', lineHeight: 1 }}>{diasRestantes}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{diasRestantes === 1 ? 'día' : 'días'}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 16, flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>PRÓXIMO CONCIERTO</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: 'white', marginBottom: 2 }}>{siguiente.artista}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  {new Date(siguiente.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · {siguiente.ciudad}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#69d08c' }}>{resumen.van}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Van</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#AFA9EC' }}>{resumen.entradas}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Entradas</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: resumen.pendientePago > 0 ? '#FAC775' : '#69d08c' }}>
                  {resumen.pendientePago > 0 ? resumen.pendientePago.toFixed(0) + '€' : '✓'}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  {resumen.pendientePago > 0 ? 'Pdte. pago' : 'Pagado'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 500, color: '#888', marginBottom: 10 }}>PRÓXIMOS CONCIERTOS</div>
        {proximos.length === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, textAlign: 'center', color: '#888', fontSize: 14 }}>
            Aún no hay conciertos.<br />
            <span style={{ color: '#7F77DD', cursor: 'pointer' }} onClick={() => setMostrarNuevo(true)}>Añade el primero</span>
          </div>
        )}
        {proximos.slice(0, 3).map(c => <TarjetaConcierto key={c.id} c={c} />)}
      </div>
    )
  }`

code = code.replace(
  /  const PantallaInicio = \(\) => \{[\s\S]*?  \}/m,
  nuevaPantallaInicio
)

writeFileSync('src/App.jsx', code)
console.log('PantallaInicio actualizada con resumen')