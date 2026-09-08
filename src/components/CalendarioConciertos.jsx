import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['L','M','X','J','V','S','D']

export default function CalendarioConciertos({ conciertos, onCerrar, onSeleccionar }) {
  const hoy = new Date(new Date().toDateString())

  // Al abrir, posicionarse en el mes del proximo concierto (o mes actual)
  const primerFuturo = conciertos
    .filter(c => new Date(c.fecha) >= hoy)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0]
  const fechaBase = primerFuturo ? new Date(primerFuturo.fecha) : new Date()

  const [mesVisible, setMesVisible] = useState(
    new Date(fechaBase.getFullYear(), fechaBase.getMonth(), 1)
  )

  // Mapa "YYYY-MM-DD" -> [conciertos]
  const conciertosPorDia = useMemo(() => {
    const mapa = {}
    conciertos.forEach(c => {
      const f = new Date(c.fecha)
      const key = `${f.getFullYear()}-${String(f.getMonth()+1).padStart(2,'0')}-${String(f.getDate()).padStart(2,'0')}`
      if (!mapa[key]) mapa[key] = []
      mapa[key].push(c)
    })
    Object.values(mapa).forEach(arr =>
      arr.sort((a, b) => (a.hora_apertura || '').localeCompare(b.hora_apertura || ''))
    )
    return mapa
  }, [conciertos])

  const anio = mesVisible.getFullYear()
  const mes = mesVisible.getMonth()
  const primerDia = new Date(anio, mes, 1)
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  // Semana empieza en lunes: 0=Lun, 6=Dom
  const offsetPrimerDia = (primerDia.getDay() + 6) % 7

  // Dias del mes anterior (para rellenar hueco al inicio)
  const celdasPrev = []
  if (offsetPrimerDia > 0) {
    const ultDiaAnt = new Date(anio, mes, 0).getDate()
    for (let i = offsetPrimerDia - 1; i >= 0; i--) {
      celdasPrev.push({ dia: ultDiaAnt - i, fuera: true })
    }
  }

  // Dias del mes actual
  const celdasMes = []
  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = new Date(anio, mes, d)
    const key = `${anio}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const conciertosDia = conciertosPorDia[key] || []
    celdasMes.push({
      dia: d, fuera: false, fecha, conciertosDia,
      esHoy: fecha.getTime() === hoy.getTime(),
      esPasado: fecha < hoy,
    })
  }

  // Rellenar hasta multiplo de 7
  const celdasSig = []
  const totalCeldas = celdasPrev.length + celdasMes.length
  const restantes = totalCeldas % 7 === 0 ? 0 : 7 - (totalCeldas % 7)
  for (let d = 1; d <= restantes; d++) {
    celdasSig.push({ dia: d, fuera: true })
  }

  const celdas = [...celdasPrev, ...celdasMes, ...celdasSig]

  const cambiarMes = (delta) => setMesVisible(new Date(anio, mes + delta, 1))

  const tocarDia = (celda) => {
    if (celda.fuera || !celda.conciertosDia || celda.conciertosDia.length === 0) return
    onSeleccionar(celda.conciertosDia[0])
  }

  const getEstiloDia = (celda) => {
    const base = {
      aspectRatio: '1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 500,
      position: 'relative',
      cursor: 'default',
      transition: 'all 0.15s',
    }
    if (celda.fuera) return { ...base, color: 'rgba(94,82,70,0.15)' }

    const tieneConcierto = celda.conciertosDia && celda.conciertosDia.length > 0
    if (tieneConcierto) {
      const estado = celda.conciertosDia[0].estado
      if (celda.esPasado) {
        return {
          ...base,
          background: 'linear-gradient(145deg, rgba(181,192,163,0.35), rgba(181,192,163,0.2))',
          color: 'rgba(94,82,70,0.6)',
          cursor: 'pointer', fontWeight: 700,
          boxShadow: 'inset 2px 2px 4px rgba(94,82,70,0.08)',
        }
      }
      if (estado === 'confirmado') {
        return {
          ...base,
          background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
          color: 'var(--warm-grey)', cursor: 'pointer', fontWeight: 700,
          boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
        }
      }
      return {
        ...base,
        background: 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
        color: 'var(--warm-grey)', cursor: 'pointer', fontWeight: 700,
        boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
      }
    }

    if (celda.esHoy) {
      return {
        ...base,
        border: '1.5px solid var(--sage-dark)',
        color: 'var(--sage-dark)', fontWeight: 700,
      }
    }
    return { ...base, color: 'var(--text-primary)' }
  }

  const btnCircle = {
    width: 36, height: 36, borderRadius: '50%',
    background: 'var(--bg)', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: 'var(--warm-grey)',
    boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(60,48,40,0.55)', backdropFilter: 'blur(4px)',
      zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 12,
    }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} className='fade-in-up' style={{
        background: 'var(--bg)',
        borderRadius: 24,
        padding: 20,
        width: '100%', maxWidth: 380,
        maxHeight: '92vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(60,48,40,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sage-dark)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Calendario</div>
          <button onClick={onCerrar} className='btn-tap' style={{ ...btnCircle, width: 32, height: 32 }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button onClick={() => cambiarMes(-1)} className='btn-tap' style={btnCircle}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.08em' }}>{MESES[mes]}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, letterSpacing: '0.2em', fontWeight: 600 }}>{anio}</div>
          </div>
          <button onClick={() => cambiarMes(1)} className='btn-tap' style={btnCircle}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} style={{
              textAlign: 'center', fontSize: 9, fontWeight: 700,
              color: 'var(--text-secondary)', letterSpacing: '0.1em',
              paddingBottom: 4,
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {celdas.map((celda, i) => (
            <div key={i} onClick={() => tocarDia(celda)} style={getEstiloDia(celda)}>
              {celda.dia}
              {celda.conciertosDia && celda.conciertosDia.length > 1 && (
                <span style={{
                  position: 'absolute', bottom: 3, right: 4,
                  fontSize: 8, fontWeight: 700, color: 'var(--warm-grey)',
                }}>·{celda.conciertosDia.length}</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(145deg, var(--sage-light), var(--sage))' }} />
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>Confirmado</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))' }} />
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>Pendiente</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(181,192,163,0.35)' }} />
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>Pasado</div>
          </div>
        </div>
      </div>
    </div>
  )
}
