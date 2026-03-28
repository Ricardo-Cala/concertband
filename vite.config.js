import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ConcertBand',
        short_name: 'ConcertBand',
        description: 'Gestor de conciertos para tu grupo de amigos',
        theme_color: '#7F77DD',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          { src: '/icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
})