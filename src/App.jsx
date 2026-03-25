import { Outlet } from 'react-router-dom'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <div className="app-shell">
      <Outlet />
      <BottomNav />
    </div>
  )
}
