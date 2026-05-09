import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import PlayerStatsProvider  from './contexts/PlayerStatsContext.tsx'
import ChampionsProvider from './contexts/ChampionsContext.tsx'
import ToastsProvider from './contexts/ToastsContext.tsx'
import DdragonVersionProvider from './contexts/DdragonVersionContext.tsx'
import ThemeProvider from './contexts/ThemeContext.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastsProvider>
          <DdragonVersionProvider>
            <ChampionsProvider>
              <PlayerStatsProvider>
                <App />
              </PlayerStatsProvider>
            </ChampionsProvider>
          </DdragonVersionProvider>
        </ToastsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
