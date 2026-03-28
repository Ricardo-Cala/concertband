export default function NavBar({ pantalla, setPantalla }) {
  const tabs = [
  { id: 'inicio', label: 'Inicio', icon: '★' },
  { id: 'conciertos', label: 'Conciertos', icon: '♪' },
  { id: 'entradas', label: 'Entradas', icon: '🎟' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'grupo', label: 'Grupo', icon: '👥' },
]

  return (
    <div style={{
      display: 'flex', borderBottom: '1px solid #e5e5e5',
      background: 'white', position: 'sticky', top: 0, zIndex: 10
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPantalla(t.id)} style={{
          flex: 1, padding: '10px 4px', fontSize: 11,
          background: 'none', border: 'none',
          borderBottom: pantalla === t.id ? '2px solid #7F77DD' : '2px solid transparent',
          color: pantalla === t.id ? '#7F77DD' : '#888',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
        }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  )
}