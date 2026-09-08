import { X } from 'lucide-react'

export default function ListaConciertos({ conciertos, onCerrar, onSeleccionar }) {
  const ordenados = [...conciertos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const hoy = new Date(new Date().toDateString())

  const tagEstado = (estado) => ({
    background: estado === 'confirmado'
      ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
      : 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
    color: estado === 'confirmado' ? 'var(--warm-grey)' : 'var(--text-secondary)',
    padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(60,48,40,0.55)', backdropFilter: 'blur(4px)',
      zIndex: 300,
      display: 'flex', alignItems: 'stretch', justifyContent: 'center',
      padding: 12,
    }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} className='fade-in-up' style={{
        background: 'var(--bg)',
        borderRadius: 24,
        padding: 18,
        width: '100%', maxWidth: 380,
        maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(60,48,40,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sage-dark)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Historial</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, letterSpacing: '0.06em' }}>
              {ordenados.length} concierto{ordenados.length === 1 ? '' : 's'}
            </div>
          </div>
          <button onClick={onCerrar} className='btn-tap' style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--warm-grey)',
            boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
          }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginRight: -4 }}>
          {ordenados.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: 30 }}>
              Sin conciertos aun
            </div>
          )}
          {ordenados.map(c => {
            const esPasado = new Date(c.fecha) < hoy
            return (
              <div key={c.id} onClick={() => onSeleccionar(c)} className='card-tap' style={{
                background: 'var(--bg)',
                borderRadius: 16,
                padding: 14,
                marginBottom: 10,
                cursor: 'pointer',
                opacity: esPasado ? 0.6 : 1,
                boxShadow: '5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, letterSpacing: '0.03em' }}>{c.artista}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.03em' }}>
                      {new Date(c.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} · {c.ciudad}
                    </div>
                    <span style={tagEstado(c.estado)}>{c.estado}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 18, flexShrink: 0 }}>&#8250;</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
