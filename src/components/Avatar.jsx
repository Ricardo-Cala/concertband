export default function Avatar({ amigo, size = 34 }) {
  if (!amigo) return null
  return amigo.foto_url ? (
    <img
      src={amigo.foto_url}
      alt={amigo.nombre}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0, display: 'block',
        boxShadow: '2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light)',
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: amigo.color, color: 'white', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 28 ? 12 : 9, fontWeight: 600,
      boxShadow: '2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light)',
      letterSpacing: '0.05em',
    }}>{amigo.iniciales}</div>
  )
}