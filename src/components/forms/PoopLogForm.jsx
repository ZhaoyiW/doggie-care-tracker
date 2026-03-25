import { useState } from 'react'
import { POOP_STATUS, getCurrentHalfHour } from '../../constants'
import { today } from '../../utils/dateUtils'
import TimePicker from '../TimePicker'
import Segmented from '../Segmented'
import useStore from '../../store'

export default function PoopLogForm({ initial, date, onClose }) {
  const addPoopLog = useStore(s => s.addPoopLog)
  const updatePoopLog = useStore(s => s.updatePoopLog)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? date ?? today(),
    time: initial?.time ?? getCurrentHalfHour(),
    status: initial?.status ?? 'NORMAL',
    notes: initial?.notes ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updatePoopLog(initial.id, form)
    else addPoopLog(form)
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
          onChange={e => set('date', e.target.value)}
        />
      </div>

      <TimePicker value={form.time} onChange={v => set('time', v)} />

      <div className="form-group">
        <label className="form-label">排便状态</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {POOP_STATUS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => set('status', s.value)}
              style={{
                padding: '12px 8px',
                borderRadius: 14,
                border: `2px solid ${form.status === s.value ? s.color : 'var(--border)'}`,
                background: form.status === s.value ? s.color + '22' : 'var(--bg)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: form.status === s.value ? 700 : 400,
                color: form.status === s.value ? s.color : 'var(--text)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          placeholder="可选..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
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
