import { useEffect } from 'react'

export default function Toast({ mensaje, tipo = 'ok', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [])

  const colores = {
    ok: { bg: '#EAF3DE', color: '#27500A', border: '#C0DD97' },
    error: { bg: '#FCEBEB', color: '#791F1F', border: '#F09595' },
  }
  const c = colores[tipo]

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '10px 20px', fontSize: 13, fontWeight: 500,
      zIndex: 999, whiteSpace: 'nowrap',
      animation: 'fadeInUp 0.2s ease',
    }}>
      {tipo === 'ok' ? '✓ ' : '✕ '}{mensaje}
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  )
}