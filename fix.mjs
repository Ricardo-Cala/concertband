import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

code = code.replace(
  `import Setlist from './Setlist'`,
  `import Setlist from './Setlist'
import FichaViaje from './FichaViaje'`
)

code = code.replace(
  `  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)`,
  `  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
  const [fichaViaje, setFichaViaje] = useState(null)`
)

code = code.replace(
  `          {transporte && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489' }}>{iconTransporte(transporte.tipo)} {transporte.tipo}</span>}
          {hotel && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#E1F5EE', color: '#085041' }}>🏨 {hotel.nombre || 'Hotel'}</span>}`,
  `          {transporte && (
            <button onClick={() => setFichaViaje('transporte')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#EEEDFE', color: '#3C3489', border: 'none', cursor: 'pointer' }}>
              {iconTransporte(transporte.tipo)} {transporte.tipo}
            </button>
          )}
          {hotel && (
            <button onClick={() => setFichaViaje('hotel')} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: '#E1F5EE', color: '#085041', border: 'none', cursor: 'pointer' }}>
              🏨 {hotel.nombre || 'Hotel'}
            </button>
          )}`
)

code = code.replace(
  `      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}`,
  `      {fichaViaje && (
        <FichaViaje
          tipo={fichaViaje}
          datos={fichaViaje === 'transporte' ? transporte : hotel}
          amigos={amigos}
          conciertoId={concierto.id}
          onCerrar={() => setFichaViaje(null)}
          onActualizado={() => { setFichaViaje(null); cargarDatos() }}
        />
      )}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}`
)

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('FichaViaje conectado a FichaConcierto')