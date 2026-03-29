import { useState } from 'react'
import { today } from '../../utils/dateUtils'
import { getCurrentHalfHour } from '../../constants'
import DatePicker from '../DatePicker'
import TimePicker from '../TimePicker'
import Segmented from '../Segmented'
import useStore from '../../store'

export default function AppointmentForm({ initial, onClose }) {
  const addAppointment = useStore(s => s.addAppointment)
  const updateAppointment = useStore(s => s.updateAppointment)
  const vets = useStore(s => s.vets || [])
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? today(),
    time: initial?.time ?? getCurrentHalfHour(),
    vetId: initial?.vetId ?? '',
    reason: initial?.reason ?? '',
    status: initial?.status ?? 'PENDING',
    notes: initial?.notes ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updateAppointment(initial.id, form)
    else addAppointment(form)
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">预约日期</label>
        <DatePicker variant="input" value={form.date} onChange={v => set('date', v)} />
      </div>

      <TimePicker value={form.time} onChange={v => set('time', v)} label="预约时间" />

      <div className="form-group">
        <label className="form-label">诊所</label>
        <select
          className="form-input form-select"
          value={form.vetId}
          onChange={e => set('vetId', e.target.value)}
        >
          <option value="">— 选择诊所（可选）—</option>
          {vets.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">就诊原因</label>
        <input
          type="text"
          className="form-input"
          placeholder="例：疫苗接种、复查"
          value={form.reason}
          onChange={e => set('reason', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">状态</label>
        <Segmented
          options={[{ value: 'PENDING', label: '📅 待办' }, { value: 'DONE', label: '✅ 已完成' }]}
          value={form.status}
          onChange={v => set('status', v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          placeholder="其他备注"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>
          {isEdit ? '保存修改' : '添加预约'}
        </button>
      </div>
    </div>
  )
}
