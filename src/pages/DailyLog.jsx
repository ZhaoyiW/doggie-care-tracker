import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store'
import Modal from '../components/Modal'
import FoodLogForm from '../components/forms/FoodLogForm'
import PoopLogForm from '../components/forms/PoopLogForm'
import SymptomLogForm from '../components/forms/SymptomLogForm'
import BathLogForm from '../components/forms/BathLogForm'
import { today, formatDateShort } from '../utils/dateUtils'
import DatePicker from '../components/DatePicker'
import { POOP_STATUS_MAP, FOOD_TYPES } from '../constants'
import { computePoopLabelForDay } from '../utils/poopLabelEngine'

const FOOD_TYPE_MAP = Object.fromEntries([
  ...FOOD_TYPES.map(f => [f.value, f.label]),
  ['DOG_FOOD', '狗粮'], ['TREATS', '零食'],
])
const TABS = ['🍚 饮食', '💩 排便', '📋 每日状态', '🛁 洗澡']

const TABLE_COLS_KEY = 'tableview_cols'
const ALL_COLUMNS = [
  { key: 'poop_count', label: '排便次数' },
  { key: 'poop_status', label: '便状态' },
  { key: 'food_count', label: '喂食次数' },
  { key: 'weight', label: '体重' },
  { key: 'spirit', label: '精神' },
  { key: 'appetite', label: '食欲' },
  { key: 'water', label: '饮水' },
  { key: 'vomiting', label: '呕吐' },
  { key: 'bath', label: '洗澡' },
]
const DEFAULT_COLS = ['poop_count', 'poop_status', 'food_count', 'weight']

function loadCols() {
  try { return JSON.parse(localStorage.getItem(TABLE_COLS_KEY)) || DEFAULT_COLS }
  catch { return DEFAULT_COLS }
}

const SPIRIT_MAP = { NORMAL: '正常', SLIGHTLY_LOW: '稍差', VERY_LOW: '很差' }
const APPETITE_MAP = { NORMAL: '正常', FAIR: '一般', POOR: '差' }
const WATER_MAP = { NORMAL: '正常', MORE: '多', LESS: '少' }

function CellValue({ col, day }) {
  switch (col) {
    case 'poop_count':
      return day.poop_count > 0
        ? <span style={{ fontWeight: 700 }}>{day.poop_count}</span>
        : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'poop_status': {
      const lbl = day.poop_label
      return lbl.key !== 'NONE'
        ? <span style={{ color: lbl.color, fontWeight: 700, fontSize: 11 }}>{lbl.label}</span>
        : <span style={{ color: 'var(--muted)' }}>—</span>
    }
    case 'food_count':
      return day.food_count > 0
        ? <span style={{ fontWeight: 700 }}>{day.food_count}</span>
        : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'weight':
      return day.weight ? <span>{day.weight}kg</span> : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'spirit':
      return day.spirit ? <span>{SPIRIT_MAP[day.spirit]}</span> : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'appetite':
      return day.appetite ? <span>{APPETITE_MAP[day.appetite]}</span> : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'water':
      return day.water ? <span>{WATER_MAP[day.water]}</span> : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'vomiting':
      return day.vomiting === 'YES'
        ? <span style={{ color: 'var(--red)' }}>⚠️</span>
        : <span style={{ color: 'var(--muted)' }}>—</span>
    case 'bath':
      return day.bath ? <span>🛁</span> : <span style={{ color: 'var(--muted)' }}>—</span>
    default:
      return <span style={{ color: 'var(--muted)' }}>—</span>
  }
}

function TableView({ foodLogs, poopLogs, symptomLogs, bathLogs }) {
  const navigate = useNavigate()
  const [range, setRange] = useState(14)
  const [cols, setCols] = useState(loadCols)
  const todayStr = today()

  function toggleCol(key) {
    setCols(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      localStorage.setItem(TABLE_COLS_KEY, JSON.stringify(next))
      return next
    })
  }

  const firstDataDate = useMemo(() => {
    const dates = [...poopLogs, ...foodLogs].map(r => r.date).filter(Boolean)
    return dates.length ? dates.reduce((a, b) => a < b ? a : b) : null
  }, [poopLogs, foodLogs])

  const dates = useMemo(() => {
    const result = []
    for (let i = 0; i < range; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      result.push(d.toISOString().slice(0, 10))
    }
    return result
  }, [range])

  const symMap = useMemo(
    () => Object.fromEntries(symptomLogs.map(s => [s.date, s])),
    [symptomLogs]
  )
  const bathDates = useMemo(() => new Set(bathLogs.map(b => b.date)), [bathLogs])

  const dayData = useMemo(() => dates.map(d => {
    const poops = poopLogs.filter(p => p.date === d)
    const foods = foodLogs.filter(f => f.date === d)
    const sym = symMap[d]
    return {
      date: d,
      poop_count: poops.length,
      poop_label: computePoopLabelForDay(poopLogs, d, firstDataDate, todayStr),
      food_count: foods.length,
      weight: sym?.weight ?? null,
      spirit: sym?.spirit ?? null,
      appetite: sym?.appetite ?? null,
      water: sym?.water ?? null,
      vomiting: sym?.vomiting ?? null,
      bath: bathDates.has(d),
    }
  }), [dates, poopLogs, foodLogs, symMap, bathDates, firstDataDate, todayStr])

  const activeCols = ALL_COLUMNS.filter(c => cols.includes(c.key))

  const stickyBase = { position: 'sticky', left: 0, zIndex: 1 }

  return (
    <div>
      {/* Range selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[7, 14, 30, 60].map(n => (
          <button key={n}
            className={`btn ${range === n ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 14px', fontSize: 13 }}
            onClick={() => setRange(n)}>
            {n}天
          </button>
        ))}
      </div>

      {/* Column toggles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {ALL_COLUMNS.map(c => {
          const active = cols.includes(c.key)
          return (
            <button key={c.key} onClick={() => toggleCol(c.key)} style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 12,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--muted)',
              cursor: 'pointer',
            }}>
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--card)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ ...stickyBase, padding: '8px 12px', textAlign: 'left', fontWeight: 700, background: 'var(--card)', whiteSpace: 'nowrap' }}>日期</th>
              {activeCols.map(c => (
                <th key={c.key} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, whiteSpace: 'nowrap' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dayData.map((row, i) => {
              const isToday = row.date === todayStr
              const rowBg = isToday ? '#F0EDE8' : i % 2 === 0 ? 'var(--bg)' : 'var(--card)'
              return (
                <tr key={row.date}
                  style={{ borderBottom: i < dayData.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
                  onClick={() => navigate(`/day/${row.date}`)}>
                  <td style={{ ...stickyBase, padding: '8px 12px', background: rowBg, fontWeight: isToday ? 700 : 400, whiteSpace: 'nowrap' }}>
                    {formatDateShort(row.date)}{isToday && <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--accent)' }}>今</span>}
                  </td>
                  {activeCols.map(c => (
                    <td key={c.key} style={{ padding: '8px 10px', textAlign: 'center', background: rowBg }}>
                      <CellValue col={c.key} day={row} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FoodList({ logs, onEdit, onDelete }) {
  if (logs.length === 0) return (
    <div className="empty-state"><div className="empty-emoji">🍚</div><p>暂无喂食记录</p></div>
  )
  return logs.map(log => {
    const itemsLabel = log.items
      ? log.items.map(it => [FOOD_TYPE_MAP[it.type] || it.type, it.content].filter(Boolean).join(' ')).join(' + ')
      : [FOOD_TYPE_MAP[log.foodType] || log.foodType, log.content].filter(Boolean).join(' ')
    const amountLabel = log.items
      ? log.items.map(it => it.amount).filter(Boolean).join(' + ')
      : log.amount
    return (
      <div key={log.id} className="record-item">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{itemsLabel}</div>
          <div className="record-meta">
            {log.time}
            {amountLabel && ` · ${amountLabel}`}
            {' · '}{log.finished ? '✅ 吃完' : '🤏 未吃完'}
            {log.notes && ` · ${log.notes}`}
          </div>
        </div>
        <div className="record-actions">
          <button className="btn btn-icon" onClick={() => onEdit(log)}>✏️</button>
          <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(log.id)}>🗑</button>
        </div>
      </div>
    )
  })
}

function BathList({ logs, onEdit, onDelete }) {
  if (logs.length === 0) return (
    <div className="empty-state"><div className="empty-emoji">🛁</div><p>暂无洗澡记录</p></div>
  )
  return logs.map(log => (
    <div key={log.id} className="record-item">
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>
          🛁 洗澡 · {log.location === 'OUTSIDE' ? `🏪 ${log.shopName || '在外'}` : '🏠 在家'}
        </div>
        <div className="record-meta">{log.notes || ''}</div>
      </div>
      <div className="record-actions">
        <button className="btn btn-icon" onClick={() => onEdit(log)}>✏️</button>
        <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(log.id)}>🗑</button>
      </div>
    </div>
  ))
}

function PoopList({ logs, onEdit, onDelete }) {
  if (logs.length === 0) return (
    <div className="empty-state"><div className="empty-emoji">💩</div><p>暂无排便记录</p></div>
  )
  return logs.map(log => {
    const status = POOP_STATUS_MAP[log.status]
    return (
      <div key={log.id} className="record-item">
        <span style={{ fontSize: 24, flexShrink: 0 }}>{status?.emoji || '💩'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: status?.color }}>
            {status?.label || log.status}
          </div>
          <div className="record-meta">
            {log.time}
            {log.hasMucus && ' · 有黏液'}
            {log.hasBlood && ' · 有血'}
            {log.onlyDrips && ' · 只有滴水'}
            {log.notes && ` · ${log.notes}`}
          </div>
        </div>
        <div className="record-actions">
          <button className="btn btn-icon" onClick={() => onEdit(log)}>✏️</button>
          <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(log.id)}>🗑</button>
        </div>
      </div>
    )
  })
}

function SymptomList({ logs, onEdit, onDelete }) {
  if (logs.length === 0) return (
    <div className="empty-state"><div className="empty-emoji">📋</div><p>暂无每日状态记录</p></div>
  )
  return logs.map(log => (
    <div key={log.id} className="record-item">
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>
          精神 {SPIRIT_MAP[log.spirit]} · 食欲 {APPETITE_MAP[log.appetite]} · 饮水 {WATER_MAP[log.water]}
        </div>
        <div className="record-meta">
          {log.vomiting === 'YES' ? '⚠️ 有呕吐' : '无呕吐'}
          {log.weight && ` · 体重 ${log.weight}kg`}
          {log.notes && ` · ${log.notes}`}
        </div>
      </div>
      <div className="record-actions">
        <button className="btn btn-icon" onClick={() => onEdit(log)}>✏️</button>
        <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(log.id)}>🗑</button>
      </div>
    </div>
  ))
}

export default function DailyLog() {
  const [viewMode, setViewMode] = useState('day')
  const [tab, setTab] = useState(0)
  const [date, setDate] = useState(today())
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)

  const foodLogs = useStore(s => s.foodLogs)
  const poopLogs = useStore(s => s.poopLogs || [])
  const symptomLogs = useStore(s => s.symptomLogs)
  const bathLogs = useStore(s => s.bathLogs || [])
  const deleteFoodLog = useStore(s => s.deleteFoodLog)
  const deletePoopLog = useStore(s => s.deletePoopLog)
  const deleteSymptomLog = useStore(s => s.deleteSymptomLog)
  const deleteBathLog = useStore(s => s.deleteBathLog)

  const dayFoods = useMemo(() =>
    foodLogs.filter(f => f.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [foodLogs, date])

  const dayPoops = useMemo(() =>
    poopLogs.filter(p => p.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [poopLogs, date])

  const daySymptoms = useMemo(() =>
    symptomLogs.filter(s => s.date === date),
    [symptomLogs, date])

  const dayBaths = useMemo(() =>
    bathLogs.filter(b => b.date === date),
    [bathLogs, date])

  function openAdd() {
    setEditing(null)
    setModal(['food', 'poop', 'symptom', 'bath'][tab])
  }

  function openEdit(item) {
    setEditing(item)
    setModal(['food', 'poop', 'symptom', 'bath'][tab])
  }

  function closeModal() {
    setModal(null)
    setEditing(null)
  }

  function changeDay(delta) {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    setDate(d.toISOString().slice(0, 10))
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>📝 每日记录</h1>
        <div style={{ display: 'flex', gap: 4, background: 'var(--border)', borderRadius: 8, padding: 3 }}>
          {[['day', '日'], ['table', '表']].map(([mode, label]) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: viewMode === mode ? 'var(--card)' : 'transparent',
              color: viewMode === mode ? 'var(--text)' : 'var(--muted)',
              boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {viewMode === 'table' ? (
        <TableView
          foodLogs={foodLogs}
          poopLogs={poopLogs}
          symptomLogs={symptomLogs}
          bathLogs={bathLogs}
        />
      ) : (
        <>
          {/* Date nav */}
          <div className="date-nav" style={{ marginBottom: 16 }}>
            <button className="btn btn-icon" onClick={() => changeDay(-1)}>←</button>
            <DatePicker value={date} onChange={setDate} />
            <button className="btn btn-icon" onClick={() => changeDay(1)}>→</button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map((t, i) => (
              <button key={t} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
            ))}
          </div>

          {tab === 0 && <FoodList logs={dayFoods} onEdit={openEdit} onDelete={deleteFoodLog} />}
          {tab === 1 && <PoopList logs={dayPoops} onEdit={openEdit} onDelete={deletePoopLog} />}
          {tab === 2 && <SymptomList logs={daySymptoms} onEdit={openEdit} onDelete={deleteSymptomLog} />}
          {tab === 3 && <BathList logs={dayBaths} onEdit={openEdit} onDelete={deleteBathLog} />}

          <button className="fab" onClick={openAdd}>+</button>
        </>
      )}

      <Modal open={modal === 'food'} onClose={closeModal} title={editing ? '✏️ 编辑喂食' : '🍚 添加喂食'}>
        <FoodLogForm initial={editing} date={date} onClose={closeModal} />
      </Modal>
      <Modal open={modal === 'poop'} onClose={closeModal} title={editing ? '✏️ 编辑排便' : '💩 添加排便'}>
        <PoopLogForm initial={editing} date={date} onClose={closeModal} />
      </Modal>
      <Modal open={modal === 'symptom'} onClose={closeModal} title={editing ? '✏️ 编辑状态' : '📋 每日状态'}>
        <SymptomLogForm initial={editing} date={date} onClose={closeModal} />
      </Modal>
      <Modal open={modal === 'bath'} onClose={closeModal} title={editing ? '✏️ 编辑洗澡' : '🛁 添加洗澡'}>
        <BathLogForm initial={editing} date={date} onClose={closeModal} />
      </Modal>
    </div>
  )
}
