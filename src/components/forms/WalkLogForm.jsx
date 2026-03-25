import { useState } from 'react'
import { getCurrentHalfHour } from '../../constants'
import { today } from '../../utils/dateUtils'
import TimePicker from '../TimePicker'
import PoopEventForm from './PoopEventForm'
import useStore from '../../store'
import { POOP_STATUS_MAP } from '../../constants'

function makeId() {
  return `pe_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export default function WalkLogForm({ initial, date, onClose }) {
  const addWalkLog = useStore(s => s.addWalkLog)
  const updateWalkLog = useStore(s => s.updateWalkLog)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? date ?? today(),
    time: initial?.time ?? getCurrentHalfHour(),
    notes: initial?.notes ?? '',
  })

  // Always use local state for poop events (both add and edit modes)
  const [poops, setPoops] = useState(
    () => (initial?.poopEvents ?? []).map(p => ({ ...p, id: p.id || makeId() }))
  )
  const [showAddPoop, setShowAddPoop] = useState(false)
  const [editingPoopId, setEditingPoopId] = useState(null)

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleAddPoop(poopData) {
    setPoops(prev => [...prev, { id: makeId(), ...poopData }])
    setShowAddPoop(false)
  }

  function handleUpdatePoop(id, poopData) {
    setPoops(prev => prev.map(p => p.id === id ? { ...p, ...poopData } : p))
    setEditingPoopId(null)
  }

  function handleDeletePoop(id) {
    setPoops(prev => prev.filter(p => p.id !== id))
  }

  function submit() {
    const walkData = {
      date: form.date,
      time: form.time,
      notes: form.notes,
      poopEvents: poops,
    }
    if (isEdit) {
      updateWalkLog(initial.id, walkData)
    } else {
      addWalkLog(walkData)
    }
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">日期</label>
        <input
          type="date"
          className="form-input"
          value={form.date}
          onChange={e => setField('date', e.target.value)}
        />
      </div>

      <TimePicker value={form.time} onChange={v => setField('time', v)} label="出发时间" />

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          style={{ minHeight: 56 }}
          placeholder="可选..."
          value={form.notes}
          onChange={e => setField('notes', e.target.value)}
        />
      </div>

      <div className="divider" />

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>💩 排便记录（{poops.length}次）</span>
          {!showAddPoop && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddPoop(true)}>
              + 添加
            </button>
          )}
        </div>

        {poops.map(poop => (
          <div key={poop.id}>
            {editingPoopId === poop.id ? (
              <PoopEventForm
                initial={poop}
                onSave={(data) => handleUpdatePoop(poop.id, data)}
                onCancel={() => setEditingPoopId(null)}
              />
            ) : (
              <div className="poop-pill">
                <span>{POOP_STATUS_MAP[poop.status]?.emoji || '💩'}</span>
                <span style={{ flex: 1, fontSize: 13 }}>
                  {poop.time} · {POOP_STATUS_MAP[poop.status]?.label || poop.status}
                  {poop.hasMucus && ' · 有黏液'}
                  {poop.hasBlood && ' · 有血'}
                  {poop.onlyDrips && ' · 只有滴水'}
                </span>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => setEditingPoopId(poop.id)}>✏️</button>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--red)' }} onClick={() => handleDeletePoop(poop.id)}>🗑</button>
              </div>
            )}
          </div>
        ))}

        {showAddPoop && (
          <PoopEventForm
            onSave={handleAddPoop}
            onCancel={() => setShowAddPoop(false)}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>
          {isEdit ? '保存修改' : '添加记录'}
        </button>
      </div>
    </div>
  )
}
