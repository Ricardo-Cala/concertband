import './App.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabase } from './supabase'

supabase.from('amigos').select('*').then(({ data, error }) => {
  if (error) {
    console.error('Error de conexión:', error)
  } else {
    console.log('Conexión OK, amigos en BD:', data)
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)