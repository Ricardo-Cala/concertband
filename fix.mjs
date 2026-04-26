import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')

code = code.replace(
  `import Avatar from './Avatar'`,
  `import Avatar from './Avatar'
import FichaAmigo from './FichaAmigo'`
)

code = code.replace(
  `  const [editando, setEditando] = useState(null)`,
  `  const [editando, setEditando] = useState(null)
  const [fichaAmigo, setFichaAmigo] = useState(null)`
)

code = code.replace(
  `  const abrirEditar = (amigo) => {`,
  `  const abrirFicha = (amigo) => setFichaAmigo(amigo)

  const abrirEditar = (amigo) => {`
)

code = code.replace(
  `  if (mostrarNuevo) return (`,
  `  if (fichaAmigo) return (
    <FichaAmigo
      amigo={fichaAmigo}
      amigos={amigos}
      onCerrar={() => setFichaAmigo(null)}
      onEditar={() => { setFichaAmigo(null); abrirEditar(fichaAmigo) }}
    />
  )

  if (mostrarNuevo) return (`
)

code = code.replace(
  `          <div key={a.id} onClick={() => abrirEditar(a)} style={{`,
  `          <div key={a.id} onClick={() => abrirFicha(a)} style={{`
)

writeFileSync('src/components/Grupo.jsx', code)
console.log('FichaAmigo conectado')