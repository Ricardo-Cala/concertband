import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaViaje.jsx', 'utf8')

// Añadir info de vuelta en vista
code = code.replace(
  `            {form.fecha_llegada && (
              <InfoRow label='Llegada' value={
                formatFecha(form.fecha_llegada) + (form.hora_llegada ? ' · ' + form.hora_llegada.slice(0,5) + 'h' : '')
              } />
            )}`,
  `            {form.fecha_llegada && (
              <InfoRow label='Llegada' value={
                formatFecha(form.fecha_llegada) + (form.hora_llegada ? ' · ' + form.hora_llegada.slice(0,5) + 'h' : '')
              } />
            )}
            {(form.numero_vuelo_vuelta || form.fecha_salida_vuelta) && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 11, fontWeight: 500, color: '#7F77DD' }}>VUELO DE VUELTA</div>
            )}
            {form.numero_vuelo_vuelta && <InfoRow label='N° vuelo vuelta' value={form.numero_vuelo_vuelta} />}
            {form.fecha_salida_vuelta && (
              <InfoRow label='Salida vuelta' value={
                formatFecha(form.fecha_salida_vuelta) + (form.hora_salida_vuelta ? ' · ' + form.hora_salida_vuelta.slice(0,5) + 'h' : '')
              } />
            )}
            {form.fecha_llegada_vuelta && (
              <InfoRow label='Llegada vuelta' value={
                formatFecha(form.fecha_llegada_vuelta) + (form.hora_llegada_vuelta ? ' · ' + form.hora_llegada_vuelta.slice(0,5) + 'h' : '')
              } />
            )}`
)

// Añadir campos de vuelta en edición
code = code.replace(
  `            {campo('Hora de llegada', 'hora_llegada', 'time')}
            <div style={{ marginBottom: 16 }}>`,
  `            {campo('Hora de llegada', 'hora_llegada', 'time')}
            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', margin: '16px 0 8px' }}>VUELO DE VUELTA</div>
            {campo('N° vuelo vuelta', 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}
            {campo('Fecha de salida vuelta', 'fecha_salida_vuelta', 'date')}
            {campo('Hora de salida vuelta', 'hora_salida_vuelta', 'time')}
            {campo('Fecha de llegada vuelta', 'fecha_llegada_vuelta', 'date')}
            {campo('Hora de llegada vuelta', 'hora_llegada_vuelta', 'time')}
            <div style={{ marginBottom: 16 }}>`
)

writeFileSync('src/components/FichaViaje.jsx', code)
console.log('Vuelo de vuelta añadido')