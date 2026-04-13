import Avatar from './Avatar'

export default function Header({ amigos }) {
  return (
    <div style={{
      position: 'relative',
      backgroundImage: 'url(/header-bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
      padding: '16px 20px 12px',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'white' }}>BOLOS GRUPIIII</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
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
}