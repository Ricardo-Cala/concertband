import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
let code = readFileSync(ruta, 'utf8')

const viejo = `  const subirEntradas = async (gasto, archivos) => {
    if (!archivos || archivos.length === 0) return
    const lista = Array.from(archivos)
    mostrarToast(\`Subiendo \${lista.length} archivo\${lista.length > 1 ? 's' : ''}...\`)
    const nuevasUrls = []
    for (const archivo of lista) {
      const ext = archivo.type.includes('pdf') ? 'pdf' : archivo.name.split('.').pop() || 'jpg'
      const path = \`\${gasto.id}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}.\${ext}\`
      const { error } = await supabase.storage.from('entradas-pdf').upload(path, archivo)
      if (!error) {
        const { data } = supabase.storage.from('entradas-pdf').getPublicUrl(path)
        nuevasUrls.push(data.publicUrl)
      }
    }
    if (nuevasUrls.length > 0) {
      const urlsActuales = gasto.pdf_urls || []
      const urlsFinales = [...urlsActuales, ...nuevasUrls]
      await supabase.from('gastos').update({ pdf_urls: urlsFinales }).eq('id', gasto.id)
      cargarDatos()
      mostrarToast(\`\${nuevasUrls.length} archivo\${nuevasUrls.length > 1 ? 's subidos' : ' subido'} correctamente\`)
    } else {
      mostrarToast('Error al subir', 'error')
    }
  }`

const nuevo = `  const subirEntradas = async (gasto, archivos) => {
    if (!archivos || archivos.length === 0) return
    const lista = Array.from(archivos)
    mostrarToast(\`Subiendo \${lista.length} archivo\${lista.length > 1 ? 's' : ''}...\`)
    const nuevasUrls = []
    let ultimoError = null
    let infoArchivo = ''
    for (const archivo of lista) {
      const nombreSeguro = archivo.name || 'archivo'
      const tipoSeguro = archivo.type || ''
      infoArchivo = \`\${nombreSeguro}|t:\${tipoSeguro || 'vacio'}|s:\${archivo.size}\`
      let ext = 'bin'
      if (tipoSeguro.includes('pdf')) ext = 'pdf'
      else if (tipoSeguro.includes('jpeg') || tipoSeguro.includes('jpg')) ext = 'jpg'
      else if (tipoSeguro.includes('png')) ext = 'png'
      else if (tipoSeguro.includes('heic')) ext = 'heic'
      else if (tipoSeguro.includes('heif')) ext = 'heif'
      else if (nombreSeguro.includes('.')) {
        const posible = nombreSeguro.split('.').pop().toLowerCase()
        if (posible && posible.length <= 5) ext = posible
      }
      const path = \`\${gasto.id}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}.\${ext}\`
      const contentType = tipoSeguro || (ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg')
      const { error } = await supabase.storage.from('entradas-pdf').upload(path, archivo, {
        contentType,
        upsert: false,
      })
      if (!error) {
        const { data } = supabase.storage.from('entradas-pdf').getPublicUrl(path)
        nuevasUrls.push(data.publicUrl)
      } else {
        ultimoError = error
        console.error('[subirEntradas] Error:', error, '| Archivo:', infoArchivo)
      }
    }
    if (nuevasUrls.length > 0) {
      const urlsActuales = gasto.pdf_urls || []
      const urlsFinales = [...urlsActuales, ...nuevasUrls]
      await supabase.from('gastos').update({ pdf_urls: urlsFinales }).eq('id', gasto.id)
      cargarDatos()
      mostrarToast(\`\${nuevasUrls.length} archivo\${nuevasUrls.length > 1 ? 's subidos' : ' subido'} correctamente\`)
    } else {
      const msg = ultimoError
        ? \`Err: \${(ultimoError.message || 'desconocido').slice(0, 60)} [\${infoArchivo.slice(0, 40)}]\`
        : 'Error al subir'
      mostrarToast(msg, 'error')
    }
  }`

if (!code.includes(viejo)) {
  console.error('ERROR: no se encontro el bloque original. El archivo puede haber cambiado.')
  process.exit(1)
}

code = code.replace(viejo, nuevo)
writeFileSync(ruta, code)
console.log('OK: FichaConcierto.jsx actualizado (contentType explicito + diagnostico de errores)')
