import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: '首页', emoji: '🏠' },
  { path: '/daily', label: '记录', emoji: '📝' },
  { path: '/calendar', label: '日历', emoji: '📅' },
  { path: '/medical', label: '医疗', emoji: '🏥' },
  { path: '/trends', label: '趋势', emoji: '📊' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path)
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: 22 }}>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
