import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/FichaConcierto.jsx'
let code = readFileSync(ruta, 'utf8')

const viejo = `      const msg = ultimoError
        ? \`Err: \${(ultimoError.message || 'desconocido').slice(0, 60)} [\${infoArchivo.slice(0, 40)}]\`
        : 'Error al subir'
      mostrarToast(msg, 'error')`

const nuevo = `      if (ultimoError) {
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

if (!code.includes(viejo)) {
  console.error('ERROR: no se encontro el bloque original. Revisa que hayas aplicado el fix anterior.')
  process.exit(1)
}

code = code.replace(viejo, nuevo)
writeFileSync(ruta, code)
console.log('OK: FichaConcierto.jsx actualizado (alert nativo con detalle completo del error)')
