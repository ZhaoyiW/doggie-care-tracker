import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store'
import { getDaysInMonth, getMonthStartWeekday, dateToDayStr, formatMonthYear, nextMonth, prevMonth, isDateToday } from '../utils/dateUtils'
import { computePoopLabel, getPoopEventsForDate } from '../utils/poopLabelEngine'
import { LABEL_COLORS } from '../constants'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function CalendarPage() {
  const navigate = useNavigate()
  const poopLogs = useStore(s => s.poopLogs || [])
  const bathLogs = useStore(s => s.bathLogs || [])
  const dewormingRecords = useStore(s => s.dewormingRecords || [])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth])
  const startWeekday = useMemo(() => getMonthStartWeekday(currentMonth), [currentMonth])

  const labelMap = useMemo(() => {
    const map = {}
    const bathDates = new Set(bathLogs.map(b => b.date))
    const dewormDates = new Set(dewormingRecords.map(r => r.date))
    days.forEach(day => {
      const dateStr = dateToDayStr(day)
      const events = getPoopEventsForDate(poopLogs, dateStr)
      map[dateStr] = {
        poop: computePoopLabel(events),
        hasBath: bathDates.has(dateStr),
        hasDeworming: dewormDates.has(dateStr),
      }
    })
    return map
  }, [days, poopLogs, bathLogs, dewormingRecords])

  return (
    <div className="page-content">
      <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700 }}>📅 日历</h1>

      {/* Month navigation */}
      <div className="date-nav" style={{ marginBottom: 16 }}>
        <button className="btn btn-icon" onClick={() => setCurrentMonth(prevMonth(currentMonth))}>←</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{formatMonthYear(currentMonth)}</span>
        <button className="btn btn-icon" onClick={() => setCurrentMonth(nextMonth(currentMonth))}>→</button>
      </div>

      {/* Weekday headers */}
      <div className="calendar-grid" style={{ marginBottom: 4 }}>
        {WEEKDAYS.map(d => (
          <div key={d} className="calendar-header-cell">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="calendar-grid">
        {Array.from({ length: startWeekday }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-cell empty" />
        ))}

        {days.map(day => {
          const dateStr = dateToDayStr(day)
          const { poop, hasBath, hasDeworming } = labelMap[dateStr]
          const isToday = isDateToday(dateStr)

          return (
            <div
              key={dateStr}
              className={`calendar-cell ${isToday ? 'today' : ''}`}
              style={{ background: poop.key !== 'NONE' ? poop.bg : 'transparent' }}
              onClick={() => navigate(`/day/${dateStr}`)}
            >
              <div className="day-num">{day.getDate()}</div>
              {poop.key !== 'NONE' && (
                <div className="poop-badge" style={{ color: poop.color, background: poop.bg + 'CC' }}>
                  {poop.label}
                </div>
              )}
              {(hasBath || hasDeworming) && (
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 2 }}>
                  {hasBath && <span style={{ fontSize: 14 }}>🛁</span>}
                  {hasDeworming && <span style={{ fontSize: 14 }}>💊</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="card" style={{ marginTop: 32 }}>
        <p className="card-title">图例</p>
        <div className="legend">
          {Object.entries(LABEL_COLORS).map(([key, { label, color, bg }]) => (
            <div key={key} className="legend-item">
              <span className="summary-dot" style={{ background: color, width: 10, height: 10, borderRadius: 3 }} />
              <span style={{ color: 'var(--text)' }}>{label}</span>
            </div>
          ))}
          <div className="legend-item">
            <span style={{ fontSize: 12 }}>🛁</span>
            <span style={{ color: 'var(--text)' }}>洗澡</span>
          </div>
          <div className="legend-item">
            <span style={{ fontSize: 12 }}>💊</span>
            <span style={{ color: 'var(--text)' }}>驱虫</span>
          </div>
        </div>
      </div>
    </div>
  )
}
