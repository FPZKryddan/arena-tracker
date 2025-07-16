import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PlayerStatsProvider  from './contexts/PlayerStatsContext.tsx'
import ChampionsProvider from './contexts/ChampionsContext.tsx'
import ToastsProvider from './contexts/ToastsContext.tsx'
import ApiStatusMessagesProvider from './contexts/ApiStatusMessagesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiStatusMessagesProvider>
      <ToastsProvider>
        <ChampionsProvider>
          <PlayerStatsProvider>
            <App />
          </PlayerStatsProvider>
        </ChampionsProvider>
      </ToastsProvider>
    </ApiStatusMessagesProvider>
  </StrictMode>,
)
