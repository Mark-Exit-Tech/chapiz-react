import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Initialize i18n before app renders
import App from './App.tsx'

// Lazy load analytics - deferred until after initial render
const SpeedInsights = lazy(() => import('@vercel/speed-insights/react').then(m => ({ default: m.SpeedInsights })))
const Analytics = lazy(() => import('@vercel/analytics/react').then(m => ({ default: m.Analytics })))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Suspense fallback={null}>
      <SpeedInsights />
      <Analytics />
    </Suspense>
  </StrictMode>,
)
