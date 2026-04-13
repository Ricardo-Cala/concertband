import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')

code = code.replace(
  ` const subirFoto = async (amigo, archivo) => {
    if (!archivo) return
    setSubiendo(amigo.id)
    const ext = archivo.name.split('.').pop()
    const path = amigo.id + '.' + ext
    await supabase.storage.from('avatares').upload(path, archivo, { upsert: true })
    const { data } = supabase.storage.from('avatares').getPublicUrl(path)
    await supabase.from('amigos').update({ foto_url: data.publicUrl + '?t=' + Date.now() }).eq('id', amigo.id)
    if (fileRefs.current[amigo.id]) fileRefs.current[amigo.id].value = ''
    setSubiendo(null)
    onActualizado()
  }`,
  ` const subirFoto = async (amigo, archivo) => {
    if (!archivo) return
    setSubiendo(amigo.id)
    const ext = archivo.name.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const path = amigo.id + '-' + timestamp + '.' + ext
    const { error } = await supabase.storage.from('avatares').upload(path, archivo, { upsert: false })
    if (!error) {
      const { data } = supabase.storage.from('avatares').getPublicUrl(path)
      await supabase.from('amigos').update({ foto_url: data.publicUrl }).eq('id', amigo.id)
    }
    if (fileRefs.current[amigo.id]) fileRefs.current[amigo.id].value = ''
    setSubiendo(null)
    onActualizado()
  }`
)

writeFileSync('src/components/Grupo.jsx', code)
console.log('subirFoto corregido')