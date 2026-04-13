import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaViaje.jsx', 'utf8')

// Vista coche — reemplazar bloque esTransporte && !editando
code = code.replace(
  `        {!editando && esTransporte && (
          <div>`,
  `        {!editando && esTransporte && datos?.tipo === 'Coche' && (
          <div>
            {(form.coches || []).length === 0 && (
              <div style={{ textAlign: 'center', color: '#aaa', fontSize: 13, padding: 16 }}>Sin coches añadidos todavía</div>
            )}
            {(form.coches || []).map((cocheId, i) => {
              const conductor = amigos.find(a => a.id === cocheId)
              return conductor ? (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid #f0f0f0' }}>
                  <Avatar amigo={conductor} size={32} />
                  <div>
                    <div style={{ fontSize: 11, color: '#888' }}>COCHE {i + 1}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{conductor.nombre}</div>
                  </div>
                </div>
              ) : null
            })}
          </div>
        )}

        {!editando && esTransporte && datos?.tipo !== 'Coche' && (
          <div>`
)

// Edición coche
code = code.replace(
  `        {editando && esTransporte && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>{tn.ida}</div>
            {campo(tn.compania, 'compania', 'text', 'Ej: Iberia, Renfe...')}`,
  `        {editando && esTransporte && datos?.tipo === 'Coche' && (
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>¿Quién pone el coche?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {amigos.map(a => {
                const coches = form.coches || []
                const seleccionado = coches.includes(a.id)
                return (
                  <div key={a.id} onClick={() => {
                    const nuevos = seleccionado ? coches.filter(id => id !== a.id) : [...coches, a.id]
                    set('coches', nuevos)
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                    background: seleccionado ? '#EEEDFE' : '#f8f8f8',
                    border: seleccionado ? '1px solid #AFA9EC' : '1px solid #eee',
                  }}>
                    <Avatar amigo={a} size={28} />
                    <span style={{ fontSize: 13, flex: 1, fontWeight: seleccionado ? 500 : 400, color: seleccionado ? '#3C3489' : 'inherit' }}>{a.nombre}</span>
                    <span style={{ fontSize: 16, color: seleccionado ? '#7F77DD' : '#ddd' }}>{seleccionado ? '🚗' : '○'}</span>
                  </div>
                )
              })}
            </div>
            <button onClick={guardar} style={{
              width: '100%', padding: 12, borderRadius: 10, border: 'none',
              background: '#7F77DD', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer'
            }}>Guardar</button>
          </div>
        )}

        {editando && esTransporte && datos?.tipo !== 'Coche' && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#7F77DD', marginBottom: 8 }}>{tn.ida}</div>
            {campo(tn.compania, 'compania', 'text', 'Ej: Iberia, Renfe...')}`
)

writeFileSync('src/components/FichaViaje.jsx', code)
console.log('Vista coche personalizada')