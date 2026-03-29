import { writeFileSync } from 'fs'

const code = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`

writeFileSync('vite.config.js', code)
console.log('vite.config.js corregido')