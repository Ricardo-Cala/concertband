import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `  const borrarGasto = async (id) => {
    await supabase.from('gastos').delete().eq('id', id)
    cargarDatos()
    mostrarToast('Comprador eliminado')
  }`,
  `  const borrarGasto = async (id) => {
    await supabase.from('gastos').delete().eq('id', id)
    cargarDatos()
    mostrarToast('Comprador eliminado')
  }

  const subirPDF = async (gasto, archivo) => {
    if (!archivo) return
    mostrarToast('Subiendo PDF...')
    const path = gasto.id + '.pdf'
    await supabase.storage.from('entradas-pdf').upload(path, archivo, { upsert: true })
    const { data } = supabase.storage.from('entradas-pdf').getPublicUrl(path)
    await supabase.from('gastos').update({ pdf_url: data.publicUrl + '?t=' + Date.now() }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('PDF subido correctamente')
  }

  const borrarPDF = async (gasto) => {
    const path = gasto.id + '.pdf'
    await supabase.storage.from('entradas-pdf').remove([path])
    await supabase.from('gastos').update({ pdf_url: null }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('PDF eliminado')
  }`
)

code = code.replace(
  `                        <button onClick={() => borrarGasto(g.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#ccc' }}>🗑️</button>`,
  `                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {g.pdf_url ? (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => window.open(g.pdf_url, '_blank')} style={{
                                background: '#EEEDFE', border: 'none', borderRadius: 8,
                                padding: '4px 10px', fontSize: 11, color: '#3C3489', cursor: 'pointer', fontWeight: 500
                              }}>📄 Ver PDF</button>
                              <button onClick={() => borrarPDF(g)} style={{
                                background: 'none', border: 'none', fontSize: 12, color: '#ccc', cursor: 'pointer'
                              }}>✕</button>
                            </div>
                          ) : (
                            <label style={{
                              background: '#f0f0f0', border: 'none', borderRadius: 8,
                              padding: '4px 10px', fontSize: 11, color: '#888', cursor: 'pointer'
                            }}>
                              📎 Subir PDF
                              <input type='file' accept='application/pdf' style={{ display: 'none' }}
                                onChange={e => subirPDF(g, e.target.files[0])} />
                            </label>
                          )}
                          <button onClick={() => borrarGasto(g.id)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#ccc' }}>🗑️</button>
                        </div>`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('PDF subida añadida a FichaConcierto')