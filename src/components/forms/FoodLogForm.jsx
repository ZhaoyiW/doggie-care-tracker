import { useState } from 'react'
import { FOOD_TYPES, getCurrentHalfHour } from '../../constants'
import { today } from '../../utils/dateUtils'
import TimePicker from '../TimePicker'
import Segmented from '../Segmented'
import useStore from '../../store'

function initItems(initial) {
  if (initial?.items) return initial.items
  if (initial?.foodType) return [{ type: initial.foodType, content: initial.content || '', amount: initial.amount || '' }]
  return [{ type: 'PRESCRIPTION', content: '', amount: '' }]
}

export default function FoodLogForm({ initial, date, onClose }) {
  const addFoodLog = useStore(s => s.addFoodLog)
  const updateFoodLog = useStore(s => s.updateFoodLog)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? date ?? today(),
    time: initial?.time ?? getCurrentHalfHour(),
    finished: initial?.finished ?? true,
    notes: initial?.notes ?? '',
  })
  const [items, setItems] = useState(() => initItems(initial))

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function setItem(idx, key, val) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item))
  }

  function addItem() {
    setItems(prev => [...prev, { type: 'PRESCRIPTION', content: '', amount: '' }])
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function submit() {
    const data = { ...form, items }
    if (isEdit) updateFoodLog(initial.id, data)
    else addFoodLog(data)
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

      <TimePicker value={form.time} onChange={v => setField('time', v)} />

      <div className="form-group">
        <label className="form-label">食物</label>
        {items.map((item, idx) => (
          <div key={idx} style={{ background: 'var(--bg)', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>品类 {idx + 1}</span>
              {items.length > 1 && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: '2px 8px' }} onClick={() => removeItem(idx)}>✕</button>
              )}
            </div>
            <Segmented options={FOOD_TYPES} value={item.type} onChange={v => setItem(idx, 'type', v)} />
            <input
              type="text"
              className="form-input"
              style={{ marginTop: 8 }}
              placeholder="内容（可选，例：皇家处方粮）"
              value={item.content}
              onChange={e => setItem(idx, 'content', e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              style={{ marginTop: 8 }}
              placeholder="数量（可选，例：100g）"
              value={item.amount}
              onChange={e => setItem(idx, 'amount', e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={addItem}>
          + 添加品类
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">是否吃完</label>
        <Segmented
          options={[
            { value: true, label: '✅ 吃完了' },
            { value: false, label: '🤏 没吃完' },
          ]}
          value={form.finished}
          onChange={v => setField('finished', v === true || v === 'true')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          placeholder="可选备注..."
          value={form.notes}
          onChange={e => setField('notes', e.target.value)}
        />
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
