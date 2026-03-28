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
          <div key={a.id} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: a.color, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 500,
            border: '1.5px solid rgba(255,255,255,0.3)'
          }}>{a.iniciales}</div>
        ))}
      </div>
    </div>
  )
}