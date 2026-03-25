import { useState, useMemo } from 'react'
import useStore from '../store'
import Modal from '../components/Modal'
import FoodLogForm from '../components/forms/FoodLogForm'
import PoopLogForm from '../components/forms/PoopLogForm'
import SymptomLogForm from '../components/forms/SymptomLogForm'
import BathLogForm from '../components/forms/BathLogForm'
import { today } from '../utils/dateUtils'
import { POOP_STATUS_MAP, FOOD_TYPES } from '../constants'

const FOOD_TYPE_MAP = Object.fromEntries([
  ...FOOD_TYPES.map(f => [f.value, f.label]),
  ['DOG_FOOD', '狗粮'], ['TREATS', '零食'], // backward compat
])
const TABS = ['🍚 饮食', '💩 排便', '📋 每日状态', '🛁 洗澡']

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
  const SPIRIT_MAP = { NORMAL: '正常', SLIGHTLY_LOW: '稍差', VERY_LOW: '很差' }
  const APPETITE_MAP = { NORMAL: '正常', FAIR: '一般', POOR: '差' }
  const WATER_MAP = { NORMAL: '正常', MORE: '偏多', LESS: '偏少' }

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
      <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700 }}>📝 每日记录</h1>

      {/* Date nav */}
      <div className="date-nav" style={{ marginBottom: 16 }}>
        <button className="btn btn-icon" onClick={() => changeDay(-1)}>←</button>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ border: 'none', background: 'none', fontSize: 16, fontWeight: 600, fontFamily: 'inherit', color: 'var(--text)', textAlign: 'center' }}
        />
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
