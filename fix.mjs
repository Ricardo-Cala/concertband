import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')

code = code.replace(
  `  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', iniciales: '', color: '#534AB7', fecha_nacimiento: '' })
  const [subiendo, setSubiendo] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({ nombre: '', iniciales: '', color: '#534AB7', fecha_nacimiento: '' })`,
  `  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
  const [subiendo, setSubiendo] = useState(null)
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [formNuevo, setFormNuevo] = useState({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })`
)

code = code.replace(
  `  const abrirEditar = (amigo) => {
    setEditando(amigo)
    setForm({
      nombre: amigo.nombre,
      iniciales: amigo.iniciales,
      color: amigo.color,
      fecha_nacimiento: amigo.fecha_nacimiento || ''
    })
  }`,
  `  const parseFecha = (fecha) => {
    if (!fecha) return { dia: '', mes: '', anio: '' }
    const d = new Date(fecha)
    return { dia: String(d.getUTCDate()), mes: String(d.getUTCMonth() + 1), anio: String(d.getUTCFullYear()) }
  }

  const buildFecha = (dia, mes, anio) => {
    if (!dia || !mes || !anio || anio.length < 4) return null
    return \`\${anio.padStart(4,'0')}-\${mes.padStart(2,'0')}-\${dia.padStart(2,'0')}\`
  }

  const abrirEditar = (amigo) => {
    setEditando(amigo)
    const { dia, mes, anio } = parseFecha(amigo.fecha_nacimiento)
    setForm({ nombre: amigo.nombre, iniciales: amigo.iniciales, color: amigo.color, dia, mes, anio })
  }`
)

code = code.replace(
  `  const guardar = async () => {
    if (!form.nombre || !form.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').update({
      nombre: form.nombre,
      iniciales: form.iniciales,
      color: form.color,
      fecha_nacimiento: form.fecha_nacimiento || null,
    }).eq('id', editando.id)
    setEditando(null)
    onActualizado()
  }`,
  `  const guardar = async () => {
    if (!form.nombre || !form.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').update({
      nombre: form.nombre,
      iniciales: form.iniciales,
      color: form.color,
      fecha_nacimiento: buildFecha(form.dia, form.mes, form.anio),
    }).eq('id', editando.id)
    setEditando(null)
    onActualizado()
  }`
)

code = code.replace(
  `  const guardarNuevo = async () => {
    if (!formNuevo.nombre || !formNuevo.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').insert([{
      nombre: formNuevo.nombre,
      iniciales: formNuevo.iniciales,
      color: formNuevo.color,
      fecha_nacimiento: formNuevo.fecha_nacimiento || null,
    }])
    setMostrarNuevo(false)
    setFormNuevo({ nombre: '', iniciales: '', color: '#534AB7', fecha_nacimiento: '' })
    onActualizado()
  }`,
  `  const guardarNuevo = async () => {
    if (!formNuevo.nombre || !formNuevo.iniciales) { alert('Rellena nombre e iniciales'); return }
    await supabase.from('amigos').insert([{
      nombre: formNuevo.nombre,
      iniciales: formNuevo.iniciales,
      color: formNuevo.color,
      fecha_nacimiento: buildFecha(formNuevo.dia, formNuevo.mes, formNuevo.anio),
    }])
    setMostrarNuevo(false)
    setFormNuevo({ nombre: '', iniciales: '', color: '#534AB7', dia: '', mes: '', anio: '' })
    onActualizado()
  }`
)

const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

code = code.replace(
  `        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Fecha de cumpleaños</label>
          <input type='date' value={f.fecha_nacimiento} onChange={e => setF(x => ({ ...x, fecha_nacimiento: e.target.value }))}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        </div>`,
  `        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>Fecha de cumpleaños</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr', gap: 6 }}>
            <input type='number' value={f.dia} onChange={e => setF(x => ({ ...x, dia: e.target.value }))}
              placeholder='Día' min='1' max='31'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />
            <select value={f.mes} onChange={e => setF(x => ({ ...x, mes: e.target.value }))}
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, background: 'white' }}>
              <option value=''>Mes</option>
              ${meses.map((m, i) => `<option value='${i+1}'>${m}</option>`).join('')}
            </select>
            <input type='number' value={f.anio} onChange={e => setF(x => ({ ...x, anio: e.target.value }))}
              placeholder='Año' min='1920' max='2010'
              style={{ padding: '8px 6px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, textAlign: 'center' }} />
          </div>
        </div>`
)

code = code.replace(
  `          {f.fecha_nacimiento && <div style={{ fontSize: 12, color: '#888' }}>🎂 {formatCumple(f.fecha_nacimiento)}</div>}`,
  `          {f.dia && f.mes && <div style={{ fontSize: 12, color: '#888' }}>🎂 {f.dia} de ${meses}[parseInt(f.mes)-1] {f.anio && \`de \${f.anio}\`}</div>}`
)

writeFileSync('src/components/Grupo.jsx', code)
console.log('Selector de fecha corregido')