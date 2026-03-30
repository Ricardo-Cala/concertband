import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `  const subirPDF = async (gasto, archivo) => {
    if (!archivo) return
    mostrarToast('Subiendo PDF...')
    const path = gasto.id + '.pdf'
    await supabase.storage.from('entradas-pdf').upload(path, archivo, { upsert: true })
    const { data } = supabase.storage.from('entradas-pdf').getPublicUrl(path)
    await supabase.from('gastos').update({ pdf_url: data.publicUrl + '?t=' + Date.now() }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('PDF subido correctamente')
  }`,
  `  const subirEntrada = async (gasto, archivo) => {
    if (!archivo) return
    mostrarToast('Subiendo entrada...')
    const ext = archivo.type.includes('pdf') ? 'pdf' : archivo.name.split('.').pop() || 'jpg'
    const path = gasto.id + '.' + ext
    await supabase.storage.from('entradas-pdf').upload(path, archivo, { upsert: true })
    const { data } = supabase.storage.from('entradas-pdf').getPublicUrl(path)
    await supabase.from('gastos').update({ pdf_url: data.publicUrl + '?t=' + Date.now() }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('Entrada subida correctamente')
  }

  const pegarEntrada = async (gasto) => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const ext = imageType.split('/')[1] || 'png'
          const archivo = new File([blob], gasto.id + '.' + ext, { type: imageType })
          await subirEntrada(gasto, archivo)
          return
        }
      }
      mostrarToast('No hay imagen en el portapapeles', 'error')
    } catch {
      mostrarToast('No se pudo acceder al portapapeles', 'error')
    }
  }`
)

code = code.replace(
  `  const borrarPDF = async (gasto) => {
    const path = gasto.id + '.pdf'
    await supabase.storage.from('entradas-pdf').remove([path])
    await supabase.from('gastos').update({ pdf_url: null }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('PDF eliminado')
  }`,
  `  const borrarEntrada = async (gasto) => {
    await supabase.from('gastos').update({ pdf_url: null }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('Entrada eliminada')
  }`
)

code = code.replace(
  `                          {g.pdf_url ? (
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
                          )}`,
  `                          {g.pdf_url ? (
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <button onClick={() => window.open(g.pdf_url, '_blank')} style={{
                                background: '#EEEDFE', border: 'none', borderRadius: 8,
                                padding: '4px 10px', fontSize: 11, color: '#3C3489', cursor: 'pointer', fontWeight: 500
                              }}>📄 Ver entrada</button>
                              <button onClick={() => borrarEntrada(g)} style={{
                                background: 'none', border: 'none', fontSize: 12, color: '#ccc', cursor: 'pointer'
                              }}>✕</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <label style={{
                                background: '#f0f0f0', border: 'none', borderRadius: 8,
                                padding: '4px 10px', fontSize: 11, color: '#888', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4
                              }}>
                                📎 Subir
                                <input type='file' accept='application/pdf,image/*' style={{ display: 'none' }}
                                  onChange={e => subirEntrada(g, e.target.files[0])} />
                              </label>
                              <button onClick={() => pegarEntrada(g)} style={{
                                background: '#f0f0f0', border: 'none', borderRadius: 8,
                                padding: '4px 10px', fontSize: 11, color: '#888', cursor: 'pointer'
                              }}>📋 Pegar</button>
                            </div>
                          )}`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('Entradas PDF e imagen actualizadas')