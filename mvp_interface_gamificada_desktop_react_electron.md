# 🎮 MVP — Interface Gamificada Desktop Educacional

---

# 📚 Objetivo do MVP

Este MVP foi projetado para demonstrar ao grupo técnico de professores uma aplicação educacional gamificada moderna.

O sistema simula:

- progressão do aluno
- sistema de missões
- ganho de XP
- feedback visual
- dashboard industrial educacional
- HUD gamificada
- interação básica
- narrativa técnica

O objetivo do usuário é:

> completar missões técnicas para restaurar uma fábrica automatizada.

---

# 🌌 Conceito Visual

O visual segue:

- Dark UI
- Neon minimalista
- Industrial cyber-tech
- Painéis holográficos
- Interface inspirada em jogos e dashboards industriais

---

# 🧠 Funcionalidades do MVP

## ✅ Funcionalidades incluídas

- Tela principal gamificada
- Barra de XP
- Sistema de níveis
- Missões interativas
- Painel de objetivos
- Sistema de conclusão de tarefas
- Dashboard industrial
- Feedback visual animado
- Sistema de notificações
- Painel lateral do jogador
- Simulação básica de progresso

---

# 🛠️ Stack Tecnológica

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS
- Framer Motion
- Lucide Icons

## Desktop

- Electron

---

# 📁 Estrutura de Pastas

```text
mvp-gamificado/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
│
├── electron/
│   └── main.js
│
├── public/
│   └── logo.png
│
└── src/
    │
    ├── main.tsx
    ├── index.css
    ├── App.tsx
    │
    ├── components/
    │   ├── Header.tsx
    │   ├── Sidebar.tsx
    │   ├── MissionCard.tsx
    │   ├── XPBar.tsx
    │   ├── Dashboard.tsx
    │   └── Notification.tsx
    │
    ├── data/
    │   └── missions.ts
    │
    └── types/
        └── mission.ts
```

---

# ⚙️ INSTALAÇÃO

---

# 1. Criar projeto

```bash
npm create vite@latest mvp-gamificado -- --template react-ts
```

---

# 2. Entrar na pasta

```bash
cd mvp-gamificado
```

---

# 3. Instalar dependências

```bash
npm install
```

---

# 4. Instalar Tailwind

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

# 5. Instalar bibliotecas

```bash
npm install framer-motion lucide-react electron concurrently wait-on
```

---

# 📦 package.json

```json
{
  "name": "mvp-gamificado",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "electron .",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\""
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.511.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "concurrently": "^8.2.2",
    "electron": "^30.0.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4",
    "wait-on": "^7.2.0"
  }
}
```

---

# ⚙️ electron/main.js

```javascript
const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win.loadURL('http://localhost:5173')
}

app.whenReady().then(() => {
  createWindow()
})
```

---

# ⚙️ tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

# ⚙️ src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background: #050816;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
}
```

---

# ⚙️ src/types/mission.ts

```typescript
export interface Mission {
  id: number
  title: string
  description: string
  xp: number
  completed: boolean
}
```

---

# ⚙️ src/data/missions.ts

```typescript
import { Mission } from '../types/mission'

export const missions: Mission[] = [
  {
    id: 1,
    title: 'Configurar Sensor Indutivo',
    description: 'Validar leitura do sensor da esteira principal.',
    xp: 100,
    completed: false,
  },
  {
    id: 2,
    title: 'Corrigir Falha no Motor',
    description: 'Identificar falha térmica no motor virtual.',
    xp: 150,
    completed: false,
  },
  {
    id: 3,
    title: 'Otimizar Linha de Produção',
    description: 'Aumentar eficiência operacional para 90%.',
    xp: 200,
    completed: false,
  },
]
```

---

# ⚙️ src/components/XPBar.tsx

```tsx
interface Props {
  xp: number
}

export default function XPBar({ xp }: Props) {
  return (
    <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden border border-cyan-500">
      <div
        className="bg-cyan-400 h-full transition-all duration-500"
        style={{ width: `${xp}%` }}
      />
    </div>
  )
}
```

---

# ⚙️ src/components/Header.tsx

```tsx
import XPBar from './XPBar'

interface Props {
  xp: number
  level: number
}

export default function Header({ xp, level }: Props) {
  return (
    <header className="p-4 border-b border-cyan-500 bg-[#0a1020] shadow-lg shadow-cyan-500/10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">
            SENAI INDUSTRIAL SYSTEM
          </h1>
          <p className="text-gray-400">
            Restaurar operação da fábrica automatizada
          </p>
        </div>

        <div className="w-[350px]">
          <div className="flex justify-between mb-2">
            <span>XP</span>
            <span>Nível {level}</span>
          </div>

          <XPBar xp={xp} />
        </div>
      </div>
    </header>
  )
}
```

---

# ⚙️ src/components/Sidebar.tsx

```tsx
import { Trophy, Shield, Factory } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-[260px] bg-[#0b1222] border-r border-cyan-500 p-4 flex flex-col gap-6">
      <div>
        <h2 className="text-xl text-cyan-400 font-bold mb-4">
          Operador
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy />
            <span>Técnico Aprendiz</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield />
            <span>Segurança: 98%</span>
          </div>

          <div className="flex items-center gap-2">
            <Factory />
            <span>Fábrica Alfa</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-cyan-400 font-bold mb-2">
          Objetivos
        </h3>

        <ul className="space-y-2 text-sm text-gray-300">
          <li>✔ Restaurar sensores</li>
          <li>✔ Validar motores</li>
          <li>⬜ Otimizar produção</li>
        </ul>
      </div>
    </aside>
  )
}
```

---

# ⚙️ src/components/MissionCard.tsx

```tsx
import { motion } from 'framer-motion'
import { Mission } from '../types/mission'

interface Props {
  mission: Mission
  onComplete: (id: number, xp: number) => void
}

export default function MissionCard({ mission, onComplete }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#111827] border border-cyan-500 rounded-xl p-5 shadow-lg shadow-cyan-500/10"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-cyan-300">
            {mission.title}
          </h3>

          <p className="text-gray-400 mt-2">
            {mission.description}
          </p>
        </div>

        <div className="text-cyan-400 font-bold">
          +{mission.xp} XP
        </div>
      </div>

      <button
        disabled={mission.completed}
        onClick={() => onComplete(mission.id, mission.xp)}
        className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition disabled:bg-gray-700 disabled:text-gray-400"
      >
        {mission.completed ? 'Missão Concluída' : 'Executar Missão'}
      </button>
    </motion.div>
  )
}
```

---

# ⚙️ src/components/Dashboard.tsx

```tsx
export default function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-[#111827] p-4 rounded-xl border border-cyan-500">
        <h3 className="text-gray-400">Eficiência</h3>
        <p className="text-3xl text-cyan-400 font-bold">89%</p>
      </div>

      <div className="bg-[#111827] p-4 rounded-xl border border-cyan-500">
        <h3 className="text-gray-400">Produção</h3>
        <p className="text-3xl text-cyan-400 font-bold">124 p/min</p>
      </div>

      <div className="bg-[#111827] p-4 rounded-xl border border-cyan-500">
        <h3 className="text-gray-400">Segurança</h3>
        <p className="text-3xl text-cyan-400 font-bold">98%</p>
      </div>
    </div>
  )
}
```

---

# ⚙️ src/components/Notification.tsx

```tsx
interface Props {
  text: string
}

export default function Notification({ text }: Props) {
  return (
    <div className="fixed bottom-6 right-6 bg-cyan-500 text-black px-6 py-4 rounded-xl font-bold shadow-2xl">
      {text}
    </div>
  )
}
```

---

# ⚙️ src/App.tsx

```tsx
import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import MissionCard from './components/MissionCard'
import Notification from './components/Notification'
import { missions as initialMissions } from './data/missions'

export default function App() {
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [notification, setNotification] = useState('')

  const [missions, setMissions] = useState(initialMissions)

  function completeMission(id: number, missionXP: number) {
    const updated = missions.map((mission) =>
      mission.id === id
        ? { ...mission, completed: true }
        : mission
    )

    setMissions(updated)

    const newXP = xp + missionXP

    setXp(newXP)

    if (newXP >= 300) {
      setLevel(2)
    }

    setNotification(`Missão concluída! +${missionXP} XP`)

    setTimeout(() => {
      setNotification('')
    }, 3000)
  }

  return (
    <div className="h-screen flex flex-col bg-[#050816] text-white">
      <Header xp={xp} level={level} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto">
          <Dashboard />

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Missões Técnicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onComplete={completeMission}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {notification && (
        <Notification text={notification} />
      )}
    </div>
  )
}
```

---

# ⚙️ src/main.tsx

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

# ▶️ EXECUTAR O MVP

```bash
npm run electron-dev
```

---

# 🎮 O QUE O MVP DEMONSTRA

Este MVP já demonstra:

## UX Gamificada

- feedback imediato
- progressão
- sistema de recompensa
- HUD industrial
- narrativa técnica

---

## Conceitos Educacionais

- aprendizagem baseada em desafios
- progressão por competências
- engajamento visual
- motivação por objetivos

---

## Conceitos Técnicos

- arquitetura moderna React
- Electron Desktop
- componentes reutilizáveis
- estado global simples
- design system industrial

---

# 🚀 EVOLUÇÕES FUTURAS

O projeto pode evoluir para:

- autenticação
- banco de dados
- multiplayer
- ranking online
- IA tutor
- digital twin
- sensores reais
- integração com CLPs
- dashboards em tempo real
- 3D industrial
- gamificação avançada
- sistema de cursos
- analytics educacional

---

# 🏆 RESULTADO ESPERADO NA APRESENTAÇÃO

Ao apresentar o MVP para os professores, o sistema demonstrará:

- como gamificação pode aumentar engajamento
- potencial para cursos técnicos
- integração com indústria 4.0
- modernização da experiência educacional
- possibilidade de treinamento industrial imersivo
- uso de tecnologias modernas de mercado

O MVP também ajuda a iniciar discussões sobre:

- laboratórios virtuais
- educação gamificada
- simuladores industriais
- IA educacional
- digital twins
- aplicações desktop modernas

