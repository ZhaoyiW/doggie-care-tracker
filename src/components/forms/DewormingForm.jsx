import { useState } from 'react'
import { today } from '../../utils/dateUtils'
import useStore from '../../store'

export default function DewormingForm({ initial, onClose }) {
  const addDewormingRecord = useStore(s => s.addDewormingRecord)
  const updateDewormingRecord = useStore(s => s.updateDewormingRecord)
  const isEdit = !!initial

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    date: initial?.date ?? today(),
    nextDueDate: initial?.nextDueDate ?? '',
    notes: initial?.notes ?? '',
  })

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updateDewormingRecord(initial.id, form)
    else addDewormingRecord(form)
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">药品名称</label>
        <input
          type="text"
          className="form-input"
          placeholder="例：拜宠爽、蓝威格"
          value={form.name}
          onChange={e => setField('name', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">用药日期</label>
        <input
          type="date"
          className="form-input"
          value={form.date}
          onChange={e => setField('date', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">下次到期日（可选）</label>
        <input
          type="date"
          className="form-input"
          value={form.nextDueDate}
          onChange={e => setField('nextDueDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          placeholder="例：体内驱虫、体外驱虫、剂量..."
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
