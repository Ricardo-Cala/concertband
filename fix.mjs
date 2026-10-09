import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/Grupo.jsx'
const original = readFileSync(ruta, 'utf8')
const crlf = original.includes('\r\n')
let code = original.replace(/\r\n/g, '\n')

const fallo = msg => {
  console.error('ERROR: ' + msg + ' - no se ha modificado nada')
  process.exit(1)
}

// 1. Arreglar diasParaCumple + anadir helpers (edad y mensajes aleatorios)
const viejo1 = `const diasParaCumple = (fecha) => {
  if (!fecha) return null
  const hoy = new Date()
  const d = new Date(fecha)
  const esteCumple = new Date(hoy.getFullYear(), d.getUTCMonth(), d.getUTCDate())
  if (esteCumple < hoy) esteCumple.setFullYear(hoy.getFullYear() + 1)
  return Math.ceil((esteCumple - hoy) / (1000 * 60 * 60 * 24))
}`

const nuevo1 = `const diasParaCumple = (fecha) => {
  if (!fecha) return null
  const hoy = new Date()
  const hoyMid = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const d = new Date(fecha)
  const esteCumple = new Date(hoyMid.getFullYear(), d.getUTCMonth(), d.getUTCDate())
  if (esteCumple < hoyMid) esteCumple.setFullYear(hoyMid.getFullYear() + 1)
  return Math.round((esteCumple - hoyMid) / (1000 * 60 * 60 * 24))
}

const calcularEdadHoy = (fecha) => {
  if (!fecha) return null
  const d = new Date(fecha)
  const edad = new Date().getFullYear() - d.getUTCFullYear()
  return edad > 0 && edad < 150 ? edad : null
}

const MENSAJES_CUMPLE = [
  '¡Que soples muchas velas!',
  '¡A por la tarta!',
  '¡Hoy toca brindis!',
  '¡Un BOLO más en la mochila!',
  '¡Felicidades, grande!',
  '¡Que lo celebres a lo grande!',
  '¡A disfrutar del día!',
  '¡Hoy mandas tú!',
]`

if (!code.includes(viejo1)) fallo('no encuentro diasParaCumple')
code = code.replace(viejo1, nuevo1)

// 2. Anadir useState para mensaje aleatorio
const viejo2 = `  const [subiendo, setSubiendo] = useState(null)`
const nuevo2 = `  const [subiendo, setSubiendo] = useState(null)
  const [mensajeCumple] = useState(() => MENSAJES_CUMPLE[Math.floor(Math.random() * MENSAJES_CUMPLE.length)])`

if (!code.includes(viejo2)) fallo('no encuentro useState subiendo')
code = code.replace(viejo2, nuevo2)

// 3. Separar proximosCumples en cumpleHoy + otrosProximos
const viejo3 = `  const proximosCumples = amigos
    .filter(a => a.fecha_nacimiento)
    .map(a => ({ ...a, dias: diasParaCumple(a.fecha_nacimiento) }))
    .filter(a => a.dias !== null && a.dias <= 30)
    .sort((a, b) => a.dias - b.dias)

  return (`

const nuevo3 = `  const proximosCumples = amigos
    .filter(a => a.fecha_nacimiento)
    .map(a => ({ ...a, dias: diasParaCumple(a.fecha_nacimiento) }))
    .filter(a => a.dias !== null && a.dias <= 30)
    .sort((a, b) => a.dias - b.dias)

  const cumpleHoy = proximosCumples.filter(a => a.dias === 0)
  const otrosProximos = proximosCumples.filter(a => a.dias !== 0)

  return (`

if (!code.includes(viejo3)) fallo('no encuentro proximosCumples')
code = code.replace(viejo3, nuevo3)

// 4. Sustituir el bloque de "Cumpleaños próximos" por banner + lista filtrada
const viejo4 = `      {proximosCumples.length > 0 && (
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
          borderRadius: 18, padding: 16, marginBottom: 16,
          boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '0.25em', textTransform: 'uppercase' }}>♪ Cumpleaños próximos</div>
          {proximosCumples.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Avatar amigo={a} size={30} />
              <span style={{ fontSize: 13, flex: 1, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.03em' }}>{a.nombre}</span>
              <span style={{ fontSize: 11, color: 'var(--sage-dark)', fontWeight: 700, letterSpacing: '0.05em' }}>
                {a.dias === 0 ? '¡Hoy! 🎉' : a.dias === 1 ? 'Mañana' : 'en ' + a.dias + ' días'}
              </span>
            </div>
          ))}
        </div>
      )}`

const nuevo4 = `      {cumpleHoy.length > 0 && (
        <>
          <style>{\`
            @keyframes cumple-latido {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.07); }
            }
            @keyframes cumple-giro {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(10deg); }
              75% { transform: rotate(-10deg); }
            }
          \`}</style>
          <div style={{
            background: 'linear-gradient(135deg, #D4A574 0%, #B5947A 55%, var(--sage) 100%)',
            borderRadius: 20, padding: 18, marginBottom: 16,
            boxShadow: '6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)',
            color: 'var(--warm-grey)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 12, opacity: 0.9 }}>
              🎂 ¡Hoy es el cumple!
            </div>
            {cumpleHoy.map(a => {
              const edad = calcularEdadHoy(a.fecha_nacimiento)
              return (
                <div key={a.id} onClick={() => abrirFicha(a)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', padding: '6px 0',
                }}>
                  <div style={{ animation: 'cumple-latido 1.8s ease-in-out infinite', flexShrink: 0 }}>
                    <Avatar amigo={a} size={62} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--warm-grey)', letterSpacing: '0.03em', lineHeight: 1.2 }}>
                      {a.nombre}{edad ? ' · ' + edad : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--warm-grey)', opacity: 0.85, marginTop: 4, letterSpacing: '0.03em', fontWeight: 600 }}>
                      {mensajeCumple}
                    </div>
                  </div>
                  <div style={{ fontSize: 28, animation: 'cumple-giro 2.4s ease-in-out infinite', transformOrigin: '50% 90%' }}>🎉</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {otrosProximos.length > 0 && (
        <div style={{
          background: 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
          borderRadius: 18, padding: 16, marginBottom: 16,
          boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '0.25em', textTransform: 'uppercase' }}>♪ Cumpleaños próximos</div>
          {otrosProximos.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Avatar amigo={a} size={30} />
              <span style={{ fontSize: 13, flex: 1, color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '0.03em' }}>{a.nombre}</span>
              <span style={{ fontSize: 11, color: 'var(--sage-dark)', fontWeight: 700, letterSpacing: '0.05em' }}>
                {a.dias === 1 ? 'Mañana' : 'en ' + a.dias + ' días'}
              </span>
            </div>
          ))}
        </div>
      )}`

if (!code.includes(viejo4)) fallo('no encuentro el bloque de cumpleaños próximos')
code = code.replace(viejo4, nuevo4)

writeFileSync(ruta, crlf ? code.replace(/\n/g, '\r\n') : code)
console.log('Hecho: banner de cumple + fix dias=0 el dia del cumpleaños')
