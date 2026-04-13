import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaViaje.jsx', 'utf8')

// Añadir función helper después de esTransporte
code = code.replace(
  `  const esTransporte = tipo === 'transporte'`,
  `  const esTransporte = tipo === 'transporte'
  const tipoNombre = () => {
    const t = datos?.tipo || ''
    if (t === 'Avión') return { ida: 'VUELO DE IDA', vuelta: 'VUELO DE VUELTA', numero: 'N° vuelo', numeroVuelta: 'N° vuelo vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
    if (t === 'Tren' || t === 'AVE') return { ida: 'TREN DE IDA', vuelta: 'TREN DE VUELTA', numero: 'N° tren', numeroVuelta: 'N° tren vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
    if (t === 'Autobús') return { ida: 'AUTOBÚS DE IDA', vuelta: 'AUTOBÚS DE VUELTA', numero: 'N° autobús', numeroVuelta: 'N° autobús vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
    return { ida: 'IDA', vuelta: 'VUELTA', numero: 'N° servicio', numeroVuelta: 'N° servicio vuelta', compania: 'Compañía', companiaVuelta: 'Compañía vuelta' }
  }
  const tn = tipoNombre()`
)

// Vista — encabezado IDA
code = code.replace(
  `            <div style={{ fontSize: 11, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>VUELO DE IDA</div>
            {form.compania && <InfoRow label='Compañía' value={form.compania} />}`,
  `            <div style={{ fontSize: 11, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>{tn.ida}</div>
            {form.compania && <InfoRow label={tn.compania} value={form.compania} />}`
)

// Vista — número vuelo ida
code = code.replace(
  `            {form.numero_vuelo && <InfoRow label='N° vuelo/tren' value={form.numero_vuelo} />}`,
  `            {form.numero_vuelo && <InfoRow label={tn.numero} value={form.numero_vuelo} />}`
)

// Vista — encabezado VUELTA y compañía vuelta
code = code.replace(
  `            {(form.numero_vuelo_vuelta || form.fecha_salida_vuelta || form.compania_vuelta) && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 11, fontWeight: 500, color: '#7F77DD' }}>VUELO DE VUELTA</div>
            )}
            {form.compania_vuelta && <InfoRow label='Compañía' value={form.compania_vuelta} />}
            {form.numero_vuelo_vuelta && <InfoRow label='N° vuelo' value={form.numero_vuelo_vuelta} />}`,
  `            {(form.numero_vuelo_vuelta || form.fecha_salida_vuelta || form.compania_vuelta) && (
              <div style={{ marginTop: 10, marginBottom: 4, fontSize: 11, fontWeight: 500, color: '#7F77DD' }}>{tn.vuelta}</div>
            )}
            {form.compania_vuelta && <InfoRow label={tn.companiaVuelta} value={form.compania_vuelta} />}
            {form.numero_vuelo_vuelta && <InfoRow label={tn.numeroVuelta} value={form.numero_vuelo_vuelta} />}`
)

// Edición — encabezado IDA
code = code.replace(
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>VUELO DE IDA</div>
            {campo('Compañía', 'compania', 'text', 'Ej: Iberia, Renfe...')}`,
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>{tn.ida}</div>
            {campo(tn.compania, 'compania', 'text', 'Ej: Iberia, Renfe...')}`
)

// Edición — número vuelo ida
code = code.replace(
  `            {campo('N° vuelo/tren', 'numero_vuelo', 'text', 'Ej: IB3456')}`,
  `            {campo(tn.numero, 'numero_vuelo', 'text', 'Ej: IB3456')}`
)

// Edición — encabezado VUELTA
code = code.replace(
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', margin: '16px 0 8px' }}>VUELO DE VUELTA</div>
            {campo('Compañía vuelta', 'compania_vuelta', 'text', 'Ej: Iberia, Ryanair...')}
            {campo('N° vuelo vuelta', 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}`,
  `            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', margin: '16px 0 8px' }}>{tn.vuelta}</div>
            {campo(tn.companiaVuelta, 'compania_vuelta', 'text', 'Ej: Iberia, Ryanair...')}
            {campo(tn.numeroVuelta, 'numero_vuelo_vuelta', 'text', 'Ej: FR 1446')}`
)

writeFileSync('src/components/FichaViaje.jsx', code)
console.log('Textos adaptados al tipo de transporte')