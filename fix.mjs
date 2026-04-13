import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/FichaViaje.jsx', 'utf8')

code = code.replace(
  `  const guardar = async () => {
    const tabla = esTransporte ? 'transportes' : 'hoteles'
    const { error } = await supabase.from(tabla).update(form).eq('id', datos.id)
    if (!error) {
      setEditando(false)
      onActualizado()
    }
  }`,
  `  const guardar = async () => {
    const tabla = esTransporte ? 'transportes' : 'hoteles'
    const camposLimpios = { ...form }
    delete camposLimpios.amigos
    delete camposLimpios.id
    delete camposLimpios.concierto_id
    delete camposLimpios.created_at
    const { error } = await supabase.from(tabla).update(camposLimpios).eq('id', datos.id)
    if (error) {
      console.error('Error guardando:', error)
      alert('Error al guardar: ' + error.message)
    } else {
      setEditando(false)
      onActualizado()
    }
  }`
)

writeFileSync('src/components/FichaViaje.jsx', code)
console.log('Función guardar corregida')