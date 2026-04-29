import { readFileSync, writeFileSync } from 'fs'

const ruta = 'src/components/EstadisticasGrupo.jsx'
let code = readFileSync(ruta, 'utf8')

// 1) Insertar la función normalizar justo después de la apertura del useMemo
const viejoInicio = `  const stats = useMemo(() => {
    const hoy = new Date()`

const nuevoInicio = `  const stats = useMemo(() => {
    const normalizar = (txt) => (txt || '')
      .toString()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .toLowerCase()
      .trim()

    const hoy = new Date()`

code = code.replace(viejoInicio, nuevoInicio)

// 2) Total de ciudades únicas (normalizado)
const viejoTotalCiudades = `    const ciudadesUnicas = new Set(conciertosPasados.map(c => c.ciudad).filter(Boolean))
    const totalCiudades = ciudadesUnicas.size`

const nuevoTotalCiudades = `    const ciudadesUnicas = new Set(
      conciertosPasados.map(c => normalizar(c.ciudad)).filter(Boolean)
    )
    const totalCiudades = ciudadesUnicas.size`

code = code.replace(viejoTotalCiudades, nuevoTotalCiudades)

// 3) Top ciudades (agrupar por clave normalizada, mostrar nombre original)
const viejoTopCiudades = `    // Top ciudades
    const ciudadesCount = {}
    conciertosPasados.forEach(c => {
      if (c.ciudad) ciudadesCount[c.ciudad] = (ciudadesCount[c.ciudad] || 0) + 1
    })
    const topCiudades = Object.entries(ciudadesCount)
      .map(([ciudad, cant]) => ({ ciudad, cantidad: cant }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8)`

const nuevoTopCiudades = `    // Top ciudades (insensible a mayusculas/acentos)
    const ciudadesMap = {}
    conciertosPasados.forEach(c => {
      if (!c.ciudad) return
      const clave = normalizar(c.ciudad)
      if (!ciudadesMap[clave]) {
        ciudadesMap[clave] = { nombre: c.ciudad.trim(), cantidad: 0 }
      }
      ciudadesMap[clave].cantidad++
    })
    const topCiudades = Object.values(ciudadesMap)
      .map(({ nombre, cantidad }) => ({ ciudad: nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8)`

code = code.replace(viejoTopCiudades, nuevoTopCiudades)

// 4) Artista top (agrupar por clave normalizada)
const viejoArtistaTop = `    // Artista top
    const artistasCount = {}
    conciertosPasados.forEach(c => {
      if (c.artista) artistasCount[c.artista] = (artistasCount[c.artista] || 0) + 1
    })
    const artistaTop = Object.entries(artistasCount).sort((a, b) => b[1] - a[1])[0]`

const nuevoArtistaTop = `    // Artista top (insensible a mayusculas/acentos)
    const artistasMap = {}
    conciertosPasados.forEach(c => {
      if (!c.artista) return
      const clave = normalizar(c.artista)
      if (!artistasMap[clave]) {
        artistasMap[clave] = { nombre: c.artista.trim(), cantidad: 0 }
      }
      artistasMap[clave].cantidad++
    })
    const artistaTopObj = Object.values(artistasMap).sort((a, b) => b.cantidad - a.cantidad)[0]
    const artistaTop = artistaTopObj ? [artistaTopObj.nombre, artistaTopObj.cantidad] : undefined`

code = code.replace(viejoArtistaTop, nuevoArtistaTop)

writeFileSync(ruta, code)
console.log('Hecho ✅ Estadísticas ahora ignoran mayúsculas y acentos')