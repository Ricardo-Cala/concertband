import { writeFileSync } from 'fs'
import { readFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')

// Reemplazar toda la función subirFoto
const inicio = code.indexOf('const subirFoto')
const fin = code.indexOf('\n  }', inicio) + 4
const funcionNueva = `const subirFoto = async (amigo, archivo) => {
    if (!archivo) return
    setSubiendo(amigo.id)
    const ext = archivo.name.split('.').pop() || 'jpg'
    const path = amigo.id + '-' + Date.now() + '.' + ext
    const { error } = await supabase.storage.from('avatares').upload(path, archivo)
    if (!error) {
      const { data } = supabase.storage.from('avatares').getPublicUrl(path)
      await supabase.from('amigos').update({ foto_url: data.publicUrl }).eq('id', amigo.id)
    }
    if (fileRefs.current[amigo.id]) fileRefs.current[amigo.id].value = ''
    setSubiendo(null)
    onActualizado()
  }`

code = code.slice(0, inicio) + funcionNueva + code.slice(fin)

writeFileSync('src/components/Grupo.jsx', code)
console.log('subirFoto reescrito correctamente')