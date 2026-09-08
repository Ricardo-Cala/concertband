import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
let code = readFileSync(ruta, 'utf8')

// === CAMBIO 1: convertir archivo a ArrayBuffer antes de subir (fix iOS Safari) ===
const viejoUpload = `      const path = \`\${gasto.id}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}.\${ext}\`
      const contentType = tipoSeguro || (ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg')
      const { error } = await supabase.storage.from('entradas-pdf').upload(path, archivo, {
        contentType,
        upsert: false,
      })`

const nuevoUpload = `      const path = \`\${gasto.id}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}.\${ext}\`
      const contentType = tipoSeguro || (ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg')
      // FIX iOS Safari: leer el archivo como ArrayBuffer evita el bug "No content provided"
      // que ocurre cuando WebKit no serializa correctamente el File como body del fetch.
      const buffer = await archivo.arrayBuffer()
      const { error } = await supabase.storage.from('entradas-pdf').upload(path, buffer, {
        contentType,
        upsert: false,
      })`

// === CAMBIO 2: quitar el alert de diagnostico, volver al toast normal ===
const viejoAlert = `      if (ultimoError) {
        const detalle = [
          'ERROR AL SUBIR',
          '',
          'Mensaje: ' + (ultimoError.message || 'sin mensaje'),
          'StatusCode: ' + (ultimoError.statusCode || 'sin codigo'),
          'Error: ' + (ultimoError.error || 'sin tipo'),
          '',
          'Archivo: ' + infoArchivo,
        ].join('\\n')
        alert(detalle)
      } else {
        mostrarToast('Error al subir', 'error')
      }`

const nuevoAlert = `      mostrarToast('Error al subir', 'error')`

let errores = 0
if (!code.includes(viejoUpload)) { console.error('ERROR: no se encontro el bloque de upload'); errores++ }
if (!code.includes(viejoAlert)) { console.error('ERROR: no se encontro el bloque de alert'); errores++ }
if (errores > 0) process.exit(1)

code = code.replace(viejoUpload, nuevoUpload)
code = code.replace(viejoAlert, nuevoAlert)
writeFileSync(ruta, code)
console.log('OK: FichaConcierto.jsx actualizado')
console.log('  - Upload usa ArrayBuffer (fix iOS Safari)')
console.log('  - Diagnostico alert eliminado, vuelve al toast')
