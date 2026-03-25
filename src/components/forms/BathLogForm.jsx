import { useState } from 'react'
import { today } from '../../utils/dateUtils'
import Segmented from '../Segmented'
import useStore from '../../store'

export default function BathLogForm({ initial, date, onClose }) {
  const addBathLog = useStore(s => s.addBathLog)
  const updateBathLog = useStore(s => s.updateBathLog)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? date ?? today(),
    location: initial?.location ?? 'HOME',
    shopName: initial?.shopName ?? '',
    notes: initial?.notes ?? '',
  })

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updateBathLog(initial.id, form)
    else addBathLog(form)
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

      <div className="form-group">
        <label className="form-label">洗澡地点</label>
        <Segmented
          options={[
            { value: 'HOME', label: '🏠 在家' },
            { value: 'OUTSIDE', label: '🏪 在外' },
          ]}
          value={form.location}
          onChange={v => setField('location', v)}
        />
        {form.location === 'OUTSIDE' && (
          <input
            type="text"
            className="form-input"
            style={{ marginTop: 8 }}
            placeholder="商家名字（例：宠爱美容店）"
            value={form.shopName}
            onChange={e => setField('shopName', e.target.value)}
          />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          placeholder="例：用了新沐浴露、吹干花了1小时..."
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
