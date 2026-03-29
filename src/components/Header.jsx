import Avatar from './Avatar'
export default function Header({ amigos }) {
  return (
    <div style={{
      background: '#1a1a2e', padding: '16px 20px 12px',
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 500 }}>ConcertBand</span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
        Tu grupo · {amigos.length} amigos
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {amigos.map(a => (
          <Avatar key={a.id} amigo={a} size={28} />
        ))}
      </div>
    </div>
  )
}