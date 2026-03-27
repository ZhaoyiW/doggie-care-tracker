import { useState, useEffect, useRef } from 'react'
import { parseISO, addMonths, subMonths } from 'date-fns'
import {
  getDaysInMonth, getMonthStartWeekday, dateToDayStr,
  formatMonthYear, isDateToday,
} from '../utils/dateUtils'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default function DatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => value ? parseISO(value) : new Date())
  const ref = useRef(null)

  useEffect(() => {
    if (value) setMonth(parseISO(value))
  }, [value])

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const days = getDaysInMonth(month)
  const startWeekday = getMonthStartWeekday(month)
  const weekday = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
    : ''

  function select(dateStr) {
    onChange(dateStr)
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: 'inherit', padding: 0,
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
        <span style={{ fontSize: 16, color: 'var(--muted)' }}>·</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--muted)' }}>{weekday}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--card)',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 4px 20px rgba(74,69,64,0.15)',
          zIndex: 300,
          width: 280,
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button className="btn btn-icon" onClick={() => setMonth(m => subMonths(m, 1))}>←</button>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{formatMonthYear(month)}</span>
            <button className="btn btn-icon" onClick={() => setMonth(m => addMonths(m, 1))}>→</button>
          </div>

          {/* Weekday headers */}
          <div className="calendar-grid" style={{ marginBottom: 4 }}>
            {WEEKDAYS.map(d => (
              <div key={d} className="calendar-header-cell">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="calendar-grid">
            {Array.from({ length: startWeekday }, (_, i) => (
              <div key={`e-${i}`} className="calendar-cell empty" />
            ))}
            {days.map(day => {
              const dateStr = dateToDayStr(day)
              const isSelected = dateStr === value
              const isToday = isDateToday(dateStr)
              return (
                <div
                  key={dateStr}
                  className={`calendar-cell ${isToday && !isSelected ? 'today' : ''}`}
                  style={{ justifyContent: 'center', minHeight: 36 }}
                  onClick={() => select(dateStr)}
                >
                  <div
                    className="day-num"
                    style={isSelected ? {
                      background: 'var(--accent)',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    } : {}}
                  >
                    {day.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
