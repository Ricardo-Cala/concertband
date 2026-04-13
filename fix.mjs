import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaViaje.jsx', 'utf8')

// Añadir "VUELO DE IDA" antes de compañía en vista
code = code.replace(
  `            {form.compania && <InfoRow label='Compañía' value={form.compania} />}`,
  `            <div style={{ fontSize: 11, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>VUELO DE IDA</div>
            {form.compania && <InfoRow label='Compañía' value={form.compania} />}`
)

// Añadir compañía vuelta en vista
code = code.replace(
  `            {(form.numero_vuelo_vuelta || form.fecha_salida_vuelta) && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 11, fontWeight: 500, color: '#7F77DD' }}>VUELO DE VUELTA</div>
            )}
            {form.numero_vuelo_vuelta && <InfoRow label='N° vuelo vuelta' value={form.numero_vuelo_vuelta} />}`,
  `            {(form.numero_vuelo_vuelta || form.fecha_salida_vuelta || form.compania_vuelta) && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 11, fontWeight: 500, color: '#7F77DD' }}>VUELO DE VUELTA</div>
            )}
            {form.compania_vuelta && <InfoRow label='Compañía' value={form.compania_vuelta} />}
            {form.numero_vuelo_vuelta && <InfoRow label='N° vuelo' value={form.numero_vuelo_vuelta} />}`
)

// Añadir campo compañía vuelta en edición
code = code.replace(
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', margin: '16px 0 8px' }}>VUELO DE VUELTA</div>
            {campo('N° vuelo vuelta', 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}`,
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', margin: '16px 0 8px' }}>VUELO DE VUELTA</div>
            {campo('Compañía vuelta', 'compania_vuelta', 'text', 'Ej: Iberia, Ryanair...')}
            {campo('N° vuelo vuelta', 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}`
)

// Añadir encabezado VUELO DE IDA en edición
code = code.replace(
  `            {campo('Compañía', 'compania', 'text', 'Ej: Iberia, Renfe...')}`,
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>VUELO DE IDA</div>
            {campo('Compañía', 'compania', 'text', 'Ej: Iberia, Renfe...')}`
)

writeFileSync('src/components/FichaViaje.jsx', code)
console.log('Vuelo de ida y compañía de vuelta añadidos')