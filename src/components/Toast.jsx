import { useEffect } from 'react'

export default function Toast({ mensaje, tipo = 'ok', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [])

  const colores = {
    ok: { bg: 'linear-gradient(145deg, var(--sage-light), var(--sage))', color: 'var(--warm-grey)' },
    error: { bg: 'linear-gradient(145deg, #D8A0A0, #C08080)', color: '#4A2020' },
  }
  const c = colores[tipo]

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: c.bg, color: c.color,
      borderRadius: 20, padding: '11px 22px', fontSize: 12, fontWeight: 700,
      zIndex: 999, whiteSpace: 'nowrap',
      letterSpacing: '0.08em',
      boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
      animation: 'fadeInUp 0.2s ease',
    }}>
      {tipo === 'ok' ? '✓ ' : '✕ '}{mensaje}
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  )
}
