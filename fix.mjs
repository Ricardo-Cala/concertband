import { readFileSync, writeFileSync } from 'fs'

// =============================================
// EstadisticasGrupo.jsx
// =============================================
let est = readFileSync('src/components/EstadisticasGrupo.jsx', 'utf8')

// Ya importa de lucide-react, añadir Mic y Ticket
est = est.replace(
  "import { ArrowLeft, TrendingUp, MapPin, Euro, Calendar, Music2, Trophy } from 'lucide-react'",
  "import { ArrowLeft, TrendingUp, MapPin, Euro, Calendar, Music2, Trophy, Mic, Ticket, Sparkles } from 'lucide-react'"
)

// Cambiar emoji props de CuriosidadCard (de string a JSX)
est = est.replace("emoji='🎤'", "emoji={<Mic size={20} />}")
est = est.replace("emoji='🎟'", "emoji={<Ticket size={20} />}")
// 🎟 puede tener variation selector
est = est.replace("emoji='🎟\uFE0F'", "emoji={<Ticket size={20} />}")
est = est.replace("emoji='📅'", "emoji={<Calendar size={20} />}")
est = est.replace("emoji='🏆'", "emoji={<Trophy size={20} />}")

// Título sección curiosidades
est = est.replace(">✨ Curiosidades del grupo<", ">{<><Sparkles size={14} /> Curiosidades del grupo</>}<")

// Header emoji
est = est.replace(">📊 Estadísticas<", ">{<><TrendingUp size={14} /> Estadísticas</>}<")

// Empty state emoji
est = est.replace("🎸", "♪")

writeFileSync('src/components/EstadisticasGrupo.jsx', est)
console.log('✔ EstadisticasGrupo.jsx')

// =============================================
// FichaConcierto.jsx
// =============================================
let fc = readFileSync('src/components/FichaConcierto.jsx', 'utf8')

// Añadir import lucide-react
const fcFirstImport = "import { useState, useEffect } from 'react'"
fc = fc.replace(
  fcFirstImport,
  fcFirstImport + "\nimport { Users, Ticket, Music, Camera, FileText, Paperclip, ClipboardPaste, Pencil, Trash2 } from 'lucide-react'"
)

// Tabs — reemplazar ternario de emojis
fc = fc.replace(
  "{t === 'asistencia' ? '👋 Asist.' : t === 'entradas' ? '🎟 Entrad.' : t === 'setlist' ? '🎵 Setlist' : '📸 Fotos'}",
  "{t === 'asistencia' ? <><Users size={12} style={{marginRight:4}} />Asist.</> : t === 'entradas' ? <><Ticket size={12} style={{marginRight:4}} />Entrad.</> : t === 'setlist' ? <><Music size={12} style={{marginRight:4}} />Setlist</> : <><Camera size={12} style={{marginRight:4}} />Fotos</>}"
)

// Botones de entrada
fc = fc.replace(">📄 Ver</button>", "><FileText size={12} style={{marginRight:4}} />Ver</button>")
fc = fc.replace(">🎟 Subir ▾</button>", "><Ticket size={12} style={{marginRight:4}} />Subir ▾</button>")
fc = fc.replace(">📎 Subir archivo", "><Paperclip size={12} style={{marginRight:4}} />Subir archivo")
fc = fc.replace(">📋 Pegar imagen</button>", "><ClipboardPaste size={12} style={{marginRight:4}} />Pegar imagen</button>")
fc = fc.replace(">✏️ Modificar</button>", "><Pencil size={12} style={{marginRight:4}} />Modificar</button>")
fc = fc.replace(">🗑️ Eliminar</button>", "><Trash2 size={12} style={{marginRight:4}} />Eliminar</button>")

// Botón editar en cabecera de gasto
fc = fc.replace(">✏️ ▾</button>", "><Pencil size={12} /> ▾</button>")

writeFileSync('src/components/FichaConcierto.jsx', fc)
console.log('✔ FichaConcierto.jsx')

// =============================================
// Setlist.jsx
// =============================================
let sl = readFileSync('src/components/Setlist.jsx', 'utf8')

// Añadir import
const slFirstImport = "import { useState } from 'react'"
sl = sl.replace(
  slFirstImport,
  slFirstImport + "\nimport { Music, Pencil } from 'lucide-react'"
)

// Botones
sl = sl.replace(">✏️ Editar</button>", "><Pencil size={12} style={{marginRight:4}} />Editar</button>")
sl = sl.replace(">✏️ Editar<", "><Pencil size={12} style={{marginRight:4}} />Editar<")

// setlist.fm button
sl = sl.replace(">🎵 Ver setlist en setlist.fm</button>", "><Music size={14} style={{marginRight:6}} />Ver setlist en setlist.fm</button>")

writeFileSync('src/components/Setlist.jsx', sl)
console.log('✔ Setlist.jsx')

// =============================================
// Album.jsx
// =============================================
let al = readFileSync('src/components/Album.jsx', 'utf8')

// Añadir import
const alFirstImport = "import { useState, useEffect, useRef } from 'react'"
al = al.replace(
  alFirstImport,
  alFirstImport + "\nimport { Camera, Download, Trash2 } from 'lucide-react'"
)

// Botón añadir
al = al.replace(">{subiendo ? 'Subiendo...' : '📸 Añadir'}", ">{subiendo ? 'Subiendo...' : <><Camera size={12} style={{marginRight:4}} />Añadir</>}")

// Empty state
al = al.replace(">📸<", "><Camera size={28} /><")

// Botones lightbox
al = al.replace(">⬇️ Descargar</button>", "><Download size={14} style={{marginRight:4}} />Descargar</button>")
al = al.replace(">🗑️ Eliminar</button>", "><Trash2 size={14} style={{marginRight:4}} />Eliminar</button>")

writeFileSync('src/components/Album.jsx', al)
console.log('✔ Album.jsx')

// =============================================
// FichaViaje.jsx
// =============================================
let fv = readFileSync('src/components/FichaViaje.jsx', 'utf8')

// Añadir import
const fvFirstImport = "import { useState, useEffect } from 'react'"
fv = fv.replace(
  fvFirstImport,
  fvFirstImport + "\nimport { Plane, Car, Bus, TrainFront, FileText, RefreshCw, Paperclip, MapPin } from 'lucide-react'"
)

// iconTransporte function — retornar JSX en vez de emoji strings
fv = fv.replace(
  `const iconTransporte = (t) => {
    if (t === 'Avión') return '✈️'
    if (t === 'Coche') return '🚗'
    if (t === 'Autobús') return '🚌'
    if (t === 'AVE') return '🚄'
    return '🚆'
  }`,
  `const iconTransporte = (t) => {
    if (t === 'Avión') return <Plane size={16} />
    if (t === 'Coche') return <Car size={16} />
    if (t === 'Autobús') return <Bus size={16} />
    if (t === 'AVE') return <TrainFront size={16} />
    return <TrainFront size={16} />
  }`
)

// Botones
fv = fv.replace(">📄 Ver billetes</button>", "><FileText size={14} style={{marginRight:4}} />Ver billetes</button>")
fv = fv.replace(">🔄", "><RefreshCw size={14} />")
fv = fv.replace(">{subiendo ? 'Subiendo...' : '📎 Subir billetes'}", ">{subiendo ? 'Subiendo...' : <><Paperclip size={14} style={{marginRight:4}} />Subir billetes</>}")
fv = fv.replace(">📍 Ver en Google Maps</button>", "><MapPin size={14} style={{marginRight:4}} />Ver en Google Maps</button>")

// Coche emoji en selector
fv = fv.replace(">{sel ? '🚗' : '○'}<", ">{sel ? <Car size={16} /> : '○'}<")

writeFileSync('src/components/FichaViaje.jsx', fv)
console.log('✔ FichaViaje.jsx')

// =============================================
// Grupo.jsx
// =============================================
let gr = readFileSync('src/components/Grupo.jsx', 'utf8')

// Verificar si tiene import de lucide-react
if (!gr.includes("from 'lucide-react'")) {
  const grFirstImport = "import { useState, useRef } from 'react'"
  if (gr.includes(grFirstImport)) {
    gr = gr.replace(grFirstImport, grFirstImport + "\nimport { BarChart3, Cake } from 'lucide-react'")
  } else {
    const alt = "import { useState, useState, useRef } from 'react'"
    gr = gr.replace(/import \{[^}]+\} from 'react'/, match => match + "\nimport { BarChart3, Cake } from 'lucide-react'")
  }
}

// Estadísticas del grupo card
gr = gr.replace(">📊<", "><BarChart3 size={18} /><")

// Cumpleaños emoji
gr = gr.replaceAll("🎂", "♪")

writeFileSync('src/components/Grupo.jsx', gr)
console.log('✔ Grupo.jsx')

// =============================================
// FichaAmigo.jsx
// =============================================
let fa = readFileSync('src/components/FichaAmigo.jsx', 'utf8')

// Añadir import
const faFirstImport = "import { useState, useEffect } from 'react'"
fa = fa.replace(
  faFirstImport,
  faFirstImport + "\nimport { MapPin, Music, Guitar, Cake, Pencil } from 'lucide-react'"
)

// Cumpleaños
fa = fa.replace(">🎂 ", "><Cake size={12} style={{marginRight:4}} />")

// Ciudad favorita
fa = fa.replace(">📍<", "><MapPin size={22} /><")

// Artistas chips
fa = fa.replaceAll(">🎵 ", "><Music size={12} style={{marginRight:4}} />")

// Géneros chips  
fa = fa.replaceAll(">🎸 ", "><Guitar size={12} style={{marginRight:4}} />")

// Botón editar gustos
fa = fa.replace(">{editandoGustos ? 'Cancelar' : '✏️ Editar'}", ">{editandoGustos ? 'Cancelar' : <><Pencil size={10} style={{marginRight:4}} />Editar</>}")

writeFileSync('src/components/FichaAmigo.jsx', fa)
console.log('✔ FichaAmigo.jsx')

// =============================================
// App.jsx — iconos en tags de conciertos
// =============================================
let app = readFileSync('src/App.jsx', 'utf8')

// Verificar si ya tiene import de lucide-react
if (!app.includes("from 'lucide-react'")) {
  app = app.replace(
    "import { useState, useEffect } from 'react'",
    "import { useState, useEffect } from 'react'\nimport { Clock, Plane, Car, Bus, TrainFront, Hotel } from 'lucide-react'"
  )
}

// Tags de hora en conciertos: ⏰ → Clock
app = app.replaceAll("⏰", "")
// Si hay 🏨 para hotel
app = app.replaceAll("🏨", "")

writeFileSync('src/App.jsx', app)
console.log('✔ App.jsx')

console.log('\n✅ Todos los emojis reemplazados por iconos lucide-react')
