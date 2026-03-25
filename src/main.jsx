import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import DailyLog from './pages/DailyLog'
import CalendarPage from './pages/Calendar'
import DayDetail from './pages/DayDetail'
import Medical from './pages/Medical'
import Trends from './pages/Trends'
import useStore from './store'

function AppRoot() {
  const loadAll = useStore(s => s.loadAll)
  const loading = useStore(s => s.loading)

  useEffect(() => {
    loadAll()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: 12,
        fontFamily: 'system-ui, sans-serif',
        color: '#8A8480',
      }}>
        <div style={{ fontSize: 48 }}>🐾</div>
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="daily" element={<DailyLog />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="day/:date" element={<DayDetail />} />
          <Route path="medical" element={<Medical />} />
          <Route path="trends" element={<Trends />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
)
