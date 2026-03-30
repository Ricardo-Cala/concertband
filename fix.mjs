import { writeFileSync, readFileSync } from 'fs'

const sw = `const CACHE = 'bolos-v' + Date.now()

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})`

writeFileSync('public/sw.js', sw)
console.log('sw.js creado')

let index = readFileSync('index.html', 'utf8')
if (!index.includes('sw.js')) {
  index = index.replace(
    '</head>',
    `  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              if (confirm('Hay una versión nueva disponible. ¿Actualizar ahora?')) {
                newSW.postMessage({ type: 'SKIP_WAITING' })
                window.location.reload()
              }
            }
          })
        })
      })
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }
  </script>
</head>`
  )
  writeFileSync('index.html', index)
  console.log('index.html actualizado')
}