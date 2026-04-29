import { readFileSync, writeFileSync } from 'fs'

let nc = readFileSync('src/components/NuevoConcierto.jsx', 'utf8')

// 1) Quitar el log de RENDER
const viejoRender = `  const [foco, setFoco] = useState(null)

  console.log('🟢 RENDER NuevoConcierto | conciertos:', conciertos?.length, '| foco:', foco, '| artista escrito:', form.artista)`

const nuevoRender = `  const [foco, setFoco] = useState(null)`

if (nc.includes(viejoRender)) {
  nc = nc.replace(viejoRender, nuevoRender)
  console.log('✅ Log de RENDER eliminado')
}

// 2) Restaurar el useMemo de sugerenciasArtista sin logs
const viejoMemo = `  const sugerenciasArtista = useMemo(() => {
    const q = normalizar(form.artista)
    console.log('🔎 calculando sugerenciasArtista | q:', q, '| listaArtistas:', listaArtistas)
    if (!q) return []
    const result = listaArtistas
      .filter(a => normalizar(a).includes(q) && normalizar(a) !== q)
      .slice(0, 5)
    console.log('🔎 resultado sugerenciasArtista:', result)
    return result
  }, [form.artista, listaArtistas])`

const nuevoMemo = `  const sugerenciasArtista = useMemo(() => {
    const q = normalizar(form.artista)
    if (!q) return []
    return listaArtistas
      .filter(a => normalizar(a).includes(q) && normalizar(a) !== q)
      .slice(0, 5)
  }, [form.artista, listaArtistas])`

if (nc.includes(viejoMemo)) {
  nc = nc.replace(viejoMemo, nuevoMemo)
  console.log('✅ Logs de sugerenciasArtista eliminados')
}

writeFileSync('src/components/NuevoConcierto.jsx', nc)
console.log('\n🎸 Listo para publicar')