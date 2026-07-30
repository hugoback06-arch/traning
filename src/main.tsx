import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import '@fontsource-variable/manrope'
import './index.css'
import App from './App.tsx'

// Detects new deployments, tells the waiting service worker (src/sw.ts) to
// activate via SKIP_WAITING, and reloads the page once it takes over — so
// users always get the latest build instead of a stale cached one.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
