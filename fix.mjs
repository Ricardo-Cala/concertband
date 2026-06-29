import { writeFileSync } from 'fs'

const code = `import { useState, useEffect } from 'react'
import { Users, Ticket, Music, Camera, FileText, Paperclip, ClipboardPaste, Pencil, Trash2, Plus, X } from 'lucide-react'
import { supabase } from '../supabase'
import Avatar from './Avatar'
import Toast from './Toast'
import Setlist from './Setlist'
import Album from './Album'
import FichaViaje from './FichaViaje'

export default function FichaConcierto({ concierto, amigos, onVolver, onEditar }) {
  const [subtab, setSubtab] = useState('asistencia')
  const [asistentes, setAsistentes] = useState([])
  const [gastos, setGastos] = useState([])
  const [pagos, setPagos] = useState([])
  const [transporte, setTransporte] = useState(null)
  const [hotel, setHotel] = useState(null)
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
  const [fichaViaje, setFichaViaje] = useState(null)
  const [formGasto, setFormGasto] = useState({ comprador_id: '', precio_entrada: '', receptores: [] })
  const [toast, setToast] = useState(null)
  const [menuSubirId, setMenuSubirId] = useState(null)
  const [menuVerId, setMenuVerId] = useState(null)
  const [menuEditarId, setMenuEditarId] = useState(null)
  const [gastoEditando, setGastoEditando] = useState(null)
  const [formEditarGasto, setFormEditarGasto] = useState({ comprador_id: '', precio_entrada: '' })

  const mostrarToast = (mensaje, tipo = 'ok') => setToast({ mensaje, tipo })

  useEffect(() => { cargarDatos() }, [])

  useEffect(() => {
    const handleClick = () => {
      setMenuSubirId(null)
      setMenuVerId(null)
      setMenuEditarId(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const cargarDatos = async () => {
    const [a, g, t, h] = await Promise.all([
      supabase.from('asistentes').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('gastos').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id),
      supabase.from('transportes').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id).single(),
      supabase.from('hoteles').select('*, amigos(nombre, iniciales, color, foto_url)').eq('concierto_id', concierto.id).single(),
    ])
    setAsistentes(a.data || [])
    setGastos(g.data || [])
    setTransporte(t.data || null)
    setHotel(h.data || null)
    if (g.data && g.data.length > 0) {
      const { data: p } = await supabase.from('pagos').select('*, amigos(nombre, iniciales, color, foto_url)').in('gasto_id', g.data.map(x => x.id))
      setPagos(p || [])
    } else {
      setPagos([])
    }
  }

  const compartirWhatsApp = () => {
    const fecha = new Date(concierto.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1)
    const mensaje = \`🎵 \${concierto.artista}\\n📅 \${fechaCapitalizada}\\n📍 \${concierto.recinto}, \${concierto.ciudad}\\n¡Apúntate en la app BOLOS GRUPI !!!\`
    const url = \`https://wa.me/?text=\${encodeURIComponent(mensaje)}\`
    window.open(url, '_blank')
  }

  const setEstadoAsistencia = async (amigoId, estado) => {
    const existente = asistentes.find(a => a.amigo_id === amigoId)
    if (estado === 'pendiente') {
      if (existente) await supabase.from('asistentes').delete().eq('id', existente.id)
    } else if (existente) {
      await supabase.from('asistentes').update({ confirmado: estado === 'va' }).eq('id', existente.id)
    } else {
      await supabase.from('asistentes').insert([{ concierto_id: concierto.id, amigo_id: amigoId, confirmado: estado === 'va' }])
    }
    cargarDatos()
    mostrarToast(estado === 'va' ? '¡Va al concierto!' : estado === 'nova' ? 'No va' : 'Pendiente de confirmar')
  }

  const getEstado = (amigoId) => {
    const a = asistentes.find(a => a.amigo_id === amigoId)
    if (!a) return 'pendiente'
    return a.confirmado ? 'va' : 'nova'
  }

  const toggleReceptor = (amigoId) => {
    setFormGasto(f => ({
      ...f,
      receptores: f.receptores.includes(amigoId)
        ? f.receptores.filter(id => id !== amigoId)
        : [...f.receptores, amigoId]
    }))
  }

  const guardarGasto = async () => {
    if (!formGasto.comprador_id || !formGasto.precio_entrada) { alert('Rellena comprador y precio'); return }
    if (formGasto.receptores.length === 0) { alert('Selecciona al menos un amigo que recibió entrada'); return }
    const totalPersonas = formGasto.receptores.length + 1
    const { data: gasto } = await supabase.from('gastos').insert([{
      concierto_id: concierto.id,
      comprador_id: formGasto.comprador_id,
      precio_entrada: parseFloat(formGasto.precio_entrada),
      cantidad: totalPersonas,
    }]).select().single()
    if (gasto) {
      const todosReceptores = [
        { amigoId: formGasto.comprador_id, pagado: true },
        ...formGasto.receptores.map(amigoId => ({ amigoId, pagado: false }))
      ]
      await supabase.from('pagos').insert(todosReceptores.map(r => ({
        gasto_id: gasto.id,
        pagador_id: r.amigoId,
        cantidad: parseFloat(formGasto.precio_entrada),
        pagado: r.pagado,
      })))
    }
    setMostrarFormGasto(false)
    setFormGasto({ comprador_id: '', precio_entrada: '', receptores: [] })
    cargarDatos()
    mostrarToast('Comprador registrado')
  }

  const guardarEdicionGasto = async () => {
    if (!formEditarGasto.comprador_id || !formEditarGasto.precio_entrada) { alert('Rellena todos los campos'); return }
    await supabase.from('gastos').update({
      comprador_id: formEditarGasto.comprador_id,
      precio_entrada: parseFloat(formEditarGasto.precio_entrada),
    }).eq('id', gastoEditando.id)
    setGastoEditando(null)
    cargarDatos()
    mostrarToast('Compra actualizada')
  }

  const togglePago = async (p) => {
    await supabase.from('pagos').update({ pagado: !p.pagado }).eq('id', p.id)
    cargarDatos()
    mostrarToast(p.pagado ? 'Marcado como pendiente' : 'Pago confirmado')
  }

  const borrarGasto = async (id) => {
    const gasto = gastos.find(g => g.id === id)
    if (gasto && gasto.pdf_urls && gasto.pdf_urls.length > 0) {
      const paths = gasto.pdf_urls.map(u => extraerPathStorage(u)).filter(Boolean)
      if (paths.length > 0) await supabase.storage.from('entradas-pdf').remove(paths)
    }
    await supabase.from('gastos').delete().eq('id', id)
    cargarDatos()
    mostrarToast('Comprador eliminado')
  }

  const extraerPathStorage = (url) => {
    if (!url) return null
    const parte = url.split('/entradas-pdf/')[1]
    if (!parte) return null
    return parte.split('?')[0]
  }

  const subirEntradas = async (gasto, archivos) => {
    if (!archivos || archivos.length === 0) return
    const lista = Array.from(archivos)
    mostrarToast(\`Subiendo \${lista.length} archivo\${lista.length > 1 ? 's' : ''}...\`)
    const nuevasUrls = []
    for (const archivo of lista) {
      const ext = archivo.type.includes('pdf') ? 'pdf' : archivo.name.split('.').pop() || 'jpg'
      const path = \`\${gasto.id}-\${Date.now()}-\${Math.random().toString(36).slice(2, 7)}.\${ext}\`
      const { error } = await supabase.storage.from('entradas-pdf').upload(path, archivo)
      if (!error) {
        const { data } = supabase.storage.from('entradas-pdf').getPublicUrl(path)
        nuevasUrls.push(data.publicUrl)
      }
    }
    if (nuevasUrls.length > 0) {
      const urlsActuales = gasto.pdf_urls || []
      const urlsFinales = [...urlsActuales, ...nuevasUrls]
      await supabase.from('gastos').update({ pdf_urls: urlsFinales }).eq('id', gasto.id)
      cargarDatos()
      mostrarToast(\`\${nuevasUrls.length} archivo\${nuevasUrls.length > 1 ? 's subidos' : ' subido'} correctamente\`)
    } else {
      mostrarToast('Error al subir', 'error')
    }
  }

  const pegarEntrada = async (gasto) => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'))
        if (imageType) {
          const blob = await item.getType(imageType)
          const ext = imageType.split('/')[1] || 'png'
          const archivo = new File([blob], \`pegado.\${ext}\`, { type: imageType })
          await subirEntradas(gasto, [archivo])
          return
        }
      }
      mostrarToast('No hay imagen en el portapapeles', 'error')
    } catch {
      mostrarToast('No se pudo acceder al portapapeles', 'error')
    }
  }

  const borrarArchivoIndividual = async (gasto, url) => {
    const path = extraerPathStorage(url)
    if (path) await supabase.storage.from('entradas-pdf').remove([path])
    const urlsActuales = gasto.pdf_urls || []
    const urlsFinales = urlsActuales.filter(u => u !== url)
    await supabase.from('gastos').update({ pdf_urls: urlsFinales }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('Archivo eliminado')
  }

  const borrarTodasEntradas = async (gasto) => {
    const urls = gasto.pdf_urls || []
    const paths = urls.map(u => extraerPathStorage(u)).filter(Boolean)
    if (paths.length > 0) await supabase.storage.from('entradas-pdf').remove(paths)
    await supabase.from('gastos').update({ pdf_urls: [] }).eq('id', gasto.id)
    cargarDatos()
    mostrarToast('Entradas eliminadas')
  }

  const getNombreArchivo = (url, index) => {
    const path = extraerPathStorage(url) || ''
    const ext = path.split('.').pop() || 'archivo'
    return \`Entrada \${index + 1}.\${ext}\`
  }

  const iconTransporte = (tipo) => {
    if (tipo === 'Avión') return '✈️'
    if (tipo === 'Coche') return '🚗'
    if (tipo === 'Autobús') return '🚌'
    if (tipo === 'AVE') return '🚄'
    return '🚆'
  }

  const totalPendiente = pagos.filter(p => !p.pagado).reduce((s, p) => s + Number(p.cantidad), 0)
  const totalCobrado = pagos.filter(p => p.pagado && p.pagador_id !== gastos.find(g => g.id === p.gasto_id)?.comprador_id).reduce((s, p) => s + Number(p.cantidad), 0)
  const totalGastado = gastos.reduce((s, g) => s + g.precio_entrada * g.cantidad, 0)
  const van = amigos.filter(a => getEstado(a.id) === 'va')
  const novan = amigos.filter(a => getEstado(a.id) === 'nova')
  const pendientes = amigos.filter(a => getEstado(a.id) === 'pendiente')

  const resumenPorAmigo = amigos.map(amigo => {
    const deudas = pagos.filter(p => p.pagador_id === amigo.id && !p.pagado)
    const pagados = pagos.filter(p => p.pagador_id === amigo.id && p.pagado && p.pagador_id !== gastos.find(g => g.id === p.gasto_id)?.comprador_id)
    const totalDebe = deudas.reduce((s, p) => s + Number(p.cantidad), 0)
    const detalleDeudas = deudas.map(p => {
      const gasto = gastos.find(g => g.id === p.gasto_id)
      const comprador = amigos.find(a => a.id === gasto?.comprador_id)
      return { comprador, cantidad: Number(p.cantidad) }
    })
    return { amigo, totalDebe, detalleDeudas, pagados }
  }).filter(r => r.totalDebe > 0 || r.pagados.length > 0)

  const card = {
    background: 'var(--bg)', borderRadius: 18, padding: 16, marginBottom: 14,
    boxShadow: '6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)',
  }
  const inputNeu = {
    width: '100%', padding: '11px 14px', borderRadius: 12, border: 'none',
    background: 'var(--bg)',
    boxShadow: 'inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)',
    fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
  }
  const labelNeu = {
    fontSize: 10, color: 'var(--text-secondary)', display: 'block', marginBottom: 8,
    fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
  }
  const tagNeu = {
    padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
    letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none',
    boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
  }
  const sageBtn = {
    background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
    color: 'var(--warm-grey)', border: 'none', borderRadius: 14,
    padding: '12px 18px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    boxShadow: '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ENCABEZADO */}
      <div style={{
        background: 'linear-gradient(135deg, var(--warm-grey), #4A4137)',
        padding: '18px 20px',
        boxShadow: '0 6px 16px rgba(60,48,40,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <button onClick={onVolver} style={{
            background: 'rgba(245,239,230,0.1)', border: 'none', color: 'var(--sage-light)',
            fontSize: 22, cursor: 'pointer', padding: 0, width: 36, height: 36, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
          }}>‹</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--sage-light)', letterSpacing: '0.04em' }}>{concierto.artista}</div>
            <div style={{ fontSize: 11, color: 'rgba(245,239,230,0.55)', marginTop: 3, letterSpacing: '0.04em' }}>
              {new Date(concierto.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {concierto.recinto}, {concierto.ciudad}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={compartirWhatsApp} style={{
              background: 'linear-gradient(145deg, var(--sage-light), var(--sage-dark))',
    color: 'var(--warm-grey)',
    borderRadius: 12, padding: '8px 16px', fontSize: 10, cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700,
    letterSpacing: '0.15em', textTransform: 'uppercase',
    boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
    fontFamily: 'inherit',
  }}>WHATSAPP</button>
            <button onClick={onEditar} style={{
              background: 'rgba(245,239,230,0.1)', border: 'none', color: 'var(--sage-light)',
              borderRadius: 10, padding: '6px 10px', fontSize: 10, cursor: 'pointer',
              letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, fontFamily: 'inherit',
            }}>EDITAR</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            ...tagNeu,
            background: concierto.estado === 'confirmado'
              ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
              : 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))',
            color: concierto.estado === 'confirmado' ? 'var(--warm-grey)' : 'var(--text-secondary)',
          }}>{concierto.estado}</span>
          {transporte && (
            <button onClick={() => setFichaViaje('transporte')} style={{
              ...tagNeu, cursor: 'pointer',
              background: 'rgba(245,239,230,0.12)', color: 'var(--sage-light)',
            }}>
              {iconTransporte(transporte.tipo)} {transporte.tipo}
            </button>
          )}
          {hotel && (
            <button onClick={() => setFichaViaje('hotel')} style={{
              ...tagNeu, cursor: 'pointer',
              background: 'rgba(245,239,230,0.12)', color: 'var(--sage-light)',
            }}>
              🏨 {hotel.nombre || 'Hotel'}
            </button>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', background: 'var(--bg)', padding: '6px 12px', gap: 6 }}>
        {['asistencia', 'entradas', 'setlist', 'fotos'].map(t => (
          <button key={t} onClick={() => setSubtab(t)} style={{
            flex: 1, padding: '10px 4px', fontSize: 9, fontWeight: 700,
            background: subtab === t ? 'linear-gradient(145deg, var(--sage-light), var(--sage))' : 'transparent',
            border: 'none', cursor: 'pointer', borderRadius: 12,
            color: subtab === t ? 'var(--warm-grey)' : 'var(--text-secondary)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            boxShadow: subtab === t ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)' : 'none',
            fontFamily: 'inherit', transition: 'all 0.15s',
          }}>
            {t === 'asistencia' ? <><Users size={12} style={{marginRight:4}} />Asist.</> : t === 'entradas' ? <><Ticket size={12} style={{marginRight:4}} />Entrad.</> : t === 'setlist' ? <><Music size={12} style={{marginRight:4}} />Setlist</> : <><Camera size={12} style={{marginRight:4}} />Fotos</>}
          </button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* TAB ASISTENCIA */}
        {subtab === 'asistencia' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ ...card, marginBottom: 0, padding: 12, textAlign: 'center', background: 'linear-gradient(145deg, var(--sage-light), var(--sage))' }}>
                <div style={{ fontSize: 24, fontWeight: 300, color: 'var(--warm-grey)' }}>{van.length}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--warm-grey)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Van</div>
              </div>
              <div style={{ ...card, marginBottom: 0, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 300, color: '#B85C5C' }}>{novan.length}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>No van</div>
              </div>
              <div style={{ ...card, marginBottom: 0, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 300, color: 'var(--sage-dark)' }}>{pendientes.length}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Pdte.</div>
              </div>
            </div>
            {amigos.map(a => {
              const estado = getEstado(a.id)
              return (
              <div key={a.id} style={{
                ...card,
                padding: '14px 16px',
                background: estado === 'va'
                  ? 'linear-gradient(145deg, #D6DDCC, #C4CBB5)'
                  : estado === 'nova'
                  ? 'linear-gradient(145deg, #E8D8D8, #D8C6C6)'
                  : 'var(--bg)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar amigo={a} size={43} />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{a.nombre}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['va', 'nova', 'pendiente'].map((est, i) => (
                      <button key={est} onClick={() => setEstadoAsistencia(a.id, est)} style={{
                        padding: '5px 10px', borderRadius: 20, border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'inherit',
                        background: estado === est
                          ? ['linear-gradient(145deg, var(--sage-light), var(--sage))', 'linear-gradient(145deg, #D8A0A0, #B87070)', 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))'][i]
                          : 'var(--bg)',
                        color: estado === est
                          ? ['var(--warm-grey)', '#fff', 'var(--text-secondary)'][i]
                          : 'var(--text-secondary)',
                        opacity: estado === est ? 1 : 0.4,
                        boxShadow: estado === est
                          ? '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)'
                          : 'inset 1px 1px 3px var(--shadow-dark), inset -1px -1px 3px var(--shadow-light)',
                      }}>{'✓✕?'[i]}</button>
                    ))}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* TAB ENTRADAS */}
        {subtab === 'entradas' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ ...card, marginBottom: 0, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--sage-dark)' }}>{totalGastado.toFixed(2)}€</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Total</div>
              </div>
              <div style={{ ...card, marginBottom: 0, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: '#B85C5C' }}>{totalPendiente.toFixed(2)}€</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Pendiente</div>
              </div>
              <div style={{ ...card, marginBottom: 0, padding: 12, textAlign: 'center', background: 'linear-gradient(145deg, var(--sage-light), var(--sage))' }}>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--warm-grey)' }}>{totalCobrado.toFixed(2)}€</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--warm-grey)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Cobrado</div>
              </div>
            </div>

            {gastos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Quién compró</div>
                {gastos.map(g => {
                  const pagosGasto = pagos.filter(p => p.gasto_id === g.id)
                  const pendientesG = pagosGasto.filter(p => !p.pagado)
                  const cobradosG = pagosGasto.filter(p => p.pagado && p.pagador_id !== g.comprador_id)
                  const archivos = g.pdf_urls || []
                  const tieneArchivos = archivos.length > 0
                  return (
                    <div key={g.id} style={card}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: pendientesG.length + cobradosG.length > 0 ? 12 : 0 }}>
                        <Avatar amigo={g.amigos} size={43} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{g.amigos?.nombre} compró</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, letterSpacing: '0.03em' }}>{g.cantidad} entrada{g.cantidad > 1 ? 's' : ''} · {Number(g.precio_entrada).toFixed(2)}€ c/u · <span style={{ fontWeight: 700, color: 'var(--sage-dark)' }}>{(g.precio_entrada * g.cantidad).toFixed(2)}€ total</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          {tieneArchivos ? (
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setMenuVerId(menuVerId === g.id ? null : g.id)}
                                style={{
                                  background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                                  border: 'none', borderRadius: 10,
                                  padding: '5px 10px', fontSize: 10, color: 'var(--warm-grey)', cursor: 'pointer', fontWeight: 700,
                                  letterSpacing: '0.05em', fontFamily: 'inherit',
                                  display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                                  boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
                                }}><FileText size={12} />Ver ({archivos.length}) ▾</button>
                              {menuVerId === g.id && (
                                <div style={{
                                  position: 'absolute', top: '110%', right: 0, zIndex: 100,
                                  background: 'var(--bg)', borderRadius: 14,
                                  boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)',
                                  minWidth: 220, overflow: 'hidden'
                                }}>
                                  {archivos.map((url, idx) => (
                                    <div key={url} style={{
                                      display: 'flex', alignItems: 'center', gap: 6,
                                      padding: '10px 14px', borderBottom: idx < archivos.length - 1 ? '1px solid var(--bg-dark)' : 'none',
                                    }}>
                                      <button onClick={() => { window.open(url, '_blank'); setMenuVerId(null) }}
                                        style={{
                                          flex: 1, background: 'none', border: 'none', textAlign: 'left',
                                          fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600,
                                          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                                        }}><FileText size={12} />{getNombreArchivo(url, idx)}</button>
                                      <button onClick={() => {
                                        if (confirm('¿Eliminar este archivo?')) borrarArchivoIndividual(g, url)
                                      }} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#B85C5C', padding: 4, display: 'flex', alignItems: 'center',
                                      }}><X size={14} /></button>
                                    </div>
                                  ))}
                                  <label style={{
                                    width: '100%', padding: '10px 14px',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontSize: 11, cursor: 'pointer', boxSizing: 'border-box',
                                    color: 'var(--sage-dark)', fontWeight: 700,
                                    borderTop: '1px solid var(--bg-dark)',
                                    letterSpacing: '0.05em',
                                  }}>
                                    <Plus size={12} /> Añadir más
                                    <input type='file' accept='application/pdf,image/*' multiple style={{ display: 'none' }}
                                      onChange={e => { subirEntradas(g, e.target.files); setMenuVerId(null); e.target.value = '' }} />
                                  </label>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setMenuSubirId(menuSubirId === g.id ? null : g.id)}
                                style={{
                                  background: 'var(--bg)', border: 'none', borderRadius: 10,
                                  padding: '5px 10px', fontSize: 10, color: 'var(--text-secondary)', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                                  fontWeight: 700, fontFamily: 'inherit',
                                  boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
                                }}><Ticket size={12} style={{marginRight:4}} />Subir ▾</button>
                              {menuSubirId === g.id && (
                                <div style={{
                                  position: 'absolute', top: '110%', right: 0, zIndex: 100,
                                  background: 'var(--bg)', borderRadius: 14,
                                  boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)',
                                  minWidth: 200, overflow: 'hidden'
                                }}>
                                  <label style={{
                                    width: '100%', padding: '12px 16px',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    fontSize: 12, cursor: 'pointer', boxSizing: 'border-box',
                                    color: 'var(--text-primary)', fontWeight: 600,
                                  }}>
                                    <Paperclip size={12} /> Subir archivos
                                    <input type='file' accept='application/pdf,image/*' multiple style={{ display: 'none' }}
                                      onChange={e => { subirEntradas(g, e.target.files); setMenuSubirId(null); e.target.value = '' }} />
                                  </label>
                                  <div style={{ height: 1, background: 'var(--bg-dark)' }} />
                                  <button onClick={() => { pegarEntrada(g); setMenuSubirId(null) }}
                                    style={{
                                      width: '100%', padding: '12px 16px', textAlign: 'left',
                                      background: 'none', border: 'none', fontSize: 12, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: 8,
                                      color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'inherit',
                                    }}><ClipboardPaste size={12} />Pegar imagen</button>
                                </div>
                              )}
                            </div>
                          )}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={() => setMenuEditarId(menuEditarId === g.id ? null : g.id)}
                              style={{
                                background: 'var(--bg)', border: 'none', borderRadius: 10,
                                padding: '5px 10px', fontSize: 10, color: 'var(--text-secondary)', cursor: 'pointer',
                                whiteSpace: 'nowrap', fontWeight: 700, fontFamily: 'inherit',
                                boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
                              }}><Pencil size={12} /> ▾</button>
                            {menuEditarId === g.id && (
                              <div style={{
                                position: 'absolute', top: '110%', right: 0, zIndex: 100,
                                background: 'var(--bg)', borderRadius: 14,
                                boxShadow: '8px 8px 20px var(--shadow-dark), -8px -8px 20px var(--shadow-light)',
                                minWidth: 165, overflow: 'hidden'
                              }}>
                                <button
                                  onClick={() => {
                                    setFormEditarGasto({ comprador_id: g.comprador_id, precio_entrada: g.precio_entrada })
                                    setGastoEditando(g)
                                    setMenuEditarId(null)
                                  }}
                                  style={{
                                    width: '100%', padding: '12px 16px', textAlign: 'left',
                                    background: 'none', border: 'none', fontSize: 12, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'inherit',
                                  }}><Pencil size={12} style={{marginRight:4}} />Modificar</button>
                                <div style={{ height: 1, background: 'var(--bg-dark)' }} />
                                <button
                                  onClick={() => {
                                    if (confirm('¿Eliminar esta compra y todos sus pagos?')) {
                                      borrarGasto(g.id)
                                      setMenuEditarId(null)
                                    }
                                  }}
                                  style={{
                                    width: '100%', padding: '12px 16px', textAlign: 'left',
                                    background: 'none', border: 'none', fontSize: 12,
                                    color: '#B85C5C', cursor: 'pointer', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
                                  }}><Trash2 size={12} style={{marginRight:4}} />Eliminar</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {pendientesG.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 9, color: '#B85C5C', marginBottom: 8, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Deben pagar a {g.amigos?.nombre}</div>
                          {pendientesG.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                              <Avatar amigo={p.amigos} size={32} />
                              <span style={{ fontSize: 13, flex: 1, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>{p.amigos?.nombre}</span>
                              <span style={{ fontSize: 12, color: '#B85C5C', fontWeight: 700 }}>{Number(p.cantidad).toFixed(2)}€</span>
                              <button onClick={() => togglePago(p)} style={{
                                padding: '4px 12px', borderRadius: 20, border: 'none',
                                background: 'linear-gradient(145deg, #E8D8D8, #D8C6C6)',
                                color: '#8B4444', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                letterSpacing: '0.08em', fontFamily: 'inherit',
                                boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
                              }}>Pendiente</button>
                            </div>
                          ))}
                        </div>
                      )}
                      {cobradosG.length > 0 && (
                        <div>
                          <div style={{ fontSize: 9, color: 'var(--sage-dark)', marginBottom: 8, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Ya pagaron</div>
                          {cobradosG.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, opacity: 0.6 }}>
                              <Avatar amigo={p.amigos} size={32} />
                              <span style={{ fontSize: 13, flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>{p.amigos?.nombre}</span>
                              <span style={{ fontSize: 12, color: 'var(--sage-dark)', fontWeight: 700 }}>{Number(p.cantidad).toFixed(2)}€</span>
                              <button onClick={() => togglePago(p)} style={{
                                padding: '4px 12px', borderRadius: 20, border: 'none',
                                background: 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                                color: 'var(--warm-grey)', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                                letterSpacing: '0.08em', fontFamily: 'inherit',
                                boxShadow: '2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)',
                              }}>✓ Pagado</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {resumenPorAmigo.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '0.25em', textTransform: 'uppercase' }}>Resumen por amigo</div>
                {resumenPorAmigo.map(({ amigo, totalDebe, detalleDeudas }) => (
                  <div key={amigo.id} style={{
                    ...card,
                    background: totalDebe > 0
                      ? 'linear-gradient(145deg, #E8D8D8, #D8C6C6)'
                      : 'linear-gradient(145deg, var(--sage-light), var(--sage))',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar amigo={amigo} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: totalDebe > 0 ? '#6B3333' : 'var(--warm-grey)', letterSpacing: '0.03em' }}>{amigo.nombre}</div>
                        {totalDebe > 0 && detalleDeudas.map((d, i) => (
                          <div key={i} style={{ fontSize: 11, color: '#8B4444', marginTop: 3 }}>
                            Debe {d.cantidad.toFixed(2)}€ a {d.comprador?.nombre}
                          </div>
                        ))}
                        {totalDebe === 0 && <div style={{ fontSize: 11, color: 'var(--warm-grey)', marginTop: 3, fontWeight: 600 }}>Todo pagado ✓</div>}
                      </div>
                      {totalDebe > 0 && <div style={{ fontSize: 16, fontWeight: 700, color: '#8B4444' }}>{totalDebe.toFixed(2)}€</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!mostrarFormGasto && (
              <button onClick={() => setMostrarFormGasto(true)} style={{
                ...sageBtn, width: '100%', padding: 14, borderRadius: 16, marginTop: 8,
                fontSize: 10,
              }}>+ Registrar quién compró</button>
            )}

            {mostrarFormGasto && (
              <div style={{ ...card, padding: 20, marginTop: 8 }}>
                <div style={{ ...labelNeu, color: 'var(--sage-dark)', marginBottom: 16 }}>¿Quién compró las entradas?</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelNeu}>Comprador</label>
                  <select value={formGasto.comprador_id} onChange={e => setFormGasto(f => ({ ...f, comprador_id: e.target.value, receptores: [] }))}
                    style={inputNeu}>
                    <option value=''>— Selecciona —</option>
                    {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelNeu}>Precio por entrada (€)</label>
                  <input type='number' value={formGasto.precio_entrada} onChange={e => setFormGasto(f => ({ ...f, precio_entrada: e.target.value }))}
                    placeholder='Ej: 37.40' step='0.01' style={inputNeu} />
                </div>
                {formGasto.comprador_id && (
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelNeu}>
                      ¿A quién le dio entradas? <span style={{ color: 'var(--sage-dark)' }}>({formGasto.receptores.length})</span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {amigos.map(a => {
                        const esComprador = a.id === formGasto.comprador_id
                        const seleccionado = esComprador || formGasto.receptores.includes(a.id)
                        return (
                          <div key={a.id} onClick={() => !esComprador && toggleReceptor(a.id)} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 14, cursor: esComprador ? 'default' : 'pointer',
                            background: esComprador
                              ? 'linear-gradient(145deg, var(--sage-light), var(--sage))'
                              : seleccionado
                              ? 'linear-gradient(145deg, var(--bg-light), var(--bg-dark))'
                              : 'var(--bg)',
                            boxShadow: seleccionado
                              ? '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)'
                              : 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                          }}>
                            <Avatar amigo={a} size={36} />
                            <span style={{ fontSize: 13, flex: 1, fontWeight: 700, color: esComprador ? 'var(--warm-grey)' : seleccionado ? 'var(--text-primary)' : 'var(--text-secondary)', letterSpacing: '0.03em' }}>{a.nombre}</span>
                            {esComprador
                              ? <span style={{ fontSize: 9, color: 'var(--warm-grey)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Comprador ✓</span>
                              : <span style={{ fontSize: 16, color: seleccionado ? 'var(--sage-dark)' : 'var(--text-secondary)', opacity: seleccionado ? 1 : 0.3 }}>{seleccionado ? '✓' : '○'}</span>
                            }
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setMostrarFormGasto(false); setFormGasto({ comprador_id: '', precio_entrada: '', receptores: [] }) }}
                    style={{
                      flex: 1, padding: 12, borderRadius: 14, border: 'none',
                      background: 'var(--bg)', color: 'var(--text-secondary)',
                      fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                    }}>Cancelar</button>
                  <button onClick={guardarGasto} style={{ ...sageBtn, flex: 1, padding: 12, borderRadius: 14, fontSize: 11 }}>Guardar</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB SETLIST */}
        {subtab === 'setlist' && (
          <Setlist concierto={concierto} onActualizado={() => {}} />
        )}
        {subtab === 'fotos' && (
          <Album concierto={concierto} amigos={amigos} />
        )}

      </div>

      {/* MODAL EDITAR GASTO */}
      {gastoEditando && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(60,48,40,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'var(--bg)', borderRadius: 22, padding: 22, width: '100%', maxWidth: 360,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light)',
          }}>
            <div style={{ ...labelNeu, color: 'var(--sage-dark)', marginBottom: 18 }}>✏️ Modificar compra</div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelNeu}>¿Quién compró?</label>
              <select value={formEditarGasto.comprador_id} onChange={e => setFormEditarGasto(f => ({ ...f, comprador_id: e.target.value }))}
                style={inputNeu}>
                <option value=''>— Selecciona —</option>
                {amigos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={labelNeu}>Precio por entrada (€)</label>
              <input type='number' value={formEditarGasto.precio_entrada} step='0.01'
                onChange={e => setFormEditarGasto(f => ({ ...f, precio_entrada: e.target.value }))}
                style={inputNeu} />
            </div>

            {/* GESTIÓN DE ARCHIVOS DE ENTRADAS */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelNeu}>
                Archivos de entradas <span style={{ color: 'var(--sage-dark)' }}>({(gastoEditando.pdf_urls || []).length})</span>
              </label>
              {(gastoEditando.pdf_urls || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                  {(gastoEditando.pdf_urls || []).map((url, idx) => (
                    <div key={url} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 12,
                      background: 'var(--bg)',
                      boxShadow: 'inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)',
                    }}>
                      <FileText size={14} style={{ color: 'var(--sage-dark)' }} />
                      <button onClick={() => window.open(url, '_blank')} style={{
                        flex: 1, background: 'none', border: 'none', textAlign: 'left',
                        fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600,
                        fontFamily: 'inherit',
                      }}>{getNombreArchivo(url, idx)}</button>
                      <button onClick={async () => {
                        if (confirm('¿Eliminar este archivo?')) {
                          await borrarArchivoIndividual(gastoEditando, url)
                          const actualizado = { ...gastoEditando, pdf_urls: (gastoEditando.pdf_urls || []).filter(u => u !== url) }
                          setGastoEditando(actualizado)
                        }
                      }} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#B85C5C', padding: 4, display: 'flex', alignItems: 'center',
                      }}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center',
                  padding: '12px', marginBottom: 10, fontStyle: 'italic',
                }}>Sin archivos subidos</div>
              )}
              <label style={{
                width: '100%', padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 11, cursor: 'pointer', boxSizing: 'border-box',
                color: 'var(--sage-dark)', fontWeight: 700,
                background: 'var(--bg)', borderRadius: 12,
                boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <Plus size={14} /> Añadir archivos
                <input type='file' accept='application/pdf,image/*' multiple style={{ display: 'none' }}
                  onChange={async e => {
                    if (e.target.files && e.target.files.length > 0) {
                      await subirEntradas(gastoEditando, e.target.files)
                      // refrescar el estado local del gasto editando
                      const { data: actualizado } = await supabase.from('gastos').select('*, amigos(nombre, iniciales, color, foto_url)').eq('id', gastoEditando.id).single()
                      if (actualizado) setGastoEditando(actualizado)
                    }
                    e.target.value = ''
                  }} />
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setGastoEditando(null)}
                style={{
                  flex: 1, padding: 12, borderRadius: 14, border: 'none',
                  background: 'var(--bg)', color: 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  boxShadow: '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)',
                }}>Cancelar</button>
              <button onClick={guardarEdicionGasto} style={{ ...sageBtn, flex: 1, padding: 12, borderRadius: 14, fontSize: 11 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {fichaViaje && (
        <FichaViaje
          tipo={fichaViaje}
          datos={fichaViaje === 'transporte' ? transporte : hotel}
          amigos={amigos}
          conciertoId={concierto.id}
          onCerrar={() => setFichaViaje(null)}
          onActualizado={() => { setFichaViaje(null); cargarDatos() }}
        />
      )}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </div>
  )
}
`

writeFileSync('src/components/FichaConcierto.jsx', code)
console.log('FichaConcierto.jsx reescrito con soporte multi-archivo')
