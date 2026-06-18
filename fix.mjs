import { writeFileSync } from 'fs'

const headerCode = `import Avatar from './Avatar'

export default function Header({ amigos }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
      padding: '18px 20px 14px',
      boxShadow: '0 6px 16px rgba(60,48,40,0.25)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}>
          <span style={{
            fontSize: 19,
            fontWeight: 600,
            color: 'var(--sage-light)',
            letterSpacing: '0.15em',
          }}>
            BOLOS GRUPIIII
          </span>
        </div>
        <div style={{
          fontSize: 10,
          color: 'rgba(245,239,230,0.55)',
          marginBottom: 12,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}>
          Tu grupo · {amigos.length} amigos
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {amigos.map(a => (
            <Avatar key={a.id} amigo={a} size={34} />
          ))}
        </div>
      </div>
    </div>
  )
}`

writeFileSync('src/components/Header.jsx', headerCode)
console.log('✔ src/components/Header.jsx actualizado (Fase 1)')