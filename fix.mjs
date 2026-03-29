import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/components/Grupo.jsx', 'utf8')
code = code.replace("type='file' accept='image/*' capture='user'", "type='file' accept='image/*'")
writeFileSync('src/components/Grupo.jsx', code)
console.log('capture eliminado correctamente')