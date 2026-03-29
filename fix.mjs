import { readFileSync, writeFileSync } from 'fs'

let code = readFileSync('src/App.jsx', 'utf8')

const pullToRefresh = `
  useEffect(() => {
    let startY = 0
    let pulling = false

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY
      pulling = window.scrollY === 0
    }

    const onTouchEnd = async (e) => {
      if (!pulling) return
      const diff = e.changedTouches[0].clientY - startY
      if (diff > 80) {
        await cargarConciertos()
        await supabase.from('amigos').select('*').then(({ data }) => data && setAmigos(data))
      }
      pulling = false
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])
`

code = code.replace(
  `  return () => supabase.removeChannel(canal)\n  }, [])`,
  `  return () => supabase.removeChannel(canal)\n  }, [])\n${pullToRefresh}`
)

writeFileSync('src/App.jsx', code)
console.log('Pull to refresh añadido')