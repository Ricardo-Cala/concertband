export default function Avatar({ amigo, size = 34 }) {
  if (!amigo) return null
  return amigo.foto_url ? (
    <img
      src={amigo.foto_url}
      alt={amigo.nombre}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0, display: 'block'
      }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: amigo.color, color: 'white', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size > 28 ? 12 : 9, fontWeight: 500,
    }}>{amigo.iniciales}</div>
  )
}