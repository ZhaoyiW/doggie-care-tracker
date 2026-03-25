import { useState } from 'react'
import { today } from '../../utils/dateUtils'
import Segmented from '../Segmented'
import useStore from '../../store'

export default function VetVisitForm({ initial, onClose }) {
  const addVetVisit = useStore(s => s.addVetVisit)
  const updateVetVisit = useStore(s => s.updateVetVisit)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? today(),
    hospital: initial?.hospital ?? '',
    doctor: initial?.doctor ?? '',
    reason: initial?.reason ?? '',
    diagnosis: initial?.diagnosis ?? '',
    treatment: initial?.treatment ?? '',
    medications: initial?.medications ?? '',
    summary: initial?.summary ?? '',
    needsFollowUp: initial?.needsFollowUp ?? false,
    followUpDate: initial?.followUpDate ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updateVetVisit(initial.id, form)
    else addVetVisit(form)
    onClose()
  }

  const fields = [
    { key: 'hospital', label: '医院 / 诊所', placeholder: '医院名称' },
    { key: 'doctor', label: '医生', placeholder: '医生姓名（可选）' },
    { key: 'reason', label: '就诊原因', placeholder: '例：拉稀、食欲不振' },
    { key: 'diagnosis', label: '诊断结果', placeholder: '医生诊断' },
    { key: 'treatment', label: '治疗方案', placeholder: '处理方式' },
    { key: 'medications', label: '药物', placeholder: '开的药物' },
    { key: 'summary', label: '总结', placeholder: '其他备注' },
  ]

  return (
    <div>
      <div className="form-group">
        <label className="form-label">就诊日期</label>
        <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
      </div>

      {fields.map(({ key, label, placeholder }) => (
        <div className="form-group" key={key}>
          <label className="form-label">{label}</label>
          <input type="text" className="form-input" placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)} />
        </div>
      ))}

      <div className="form-group">
        <label className="form-label">是否需要复诊</label>
        <Segmented
          options={[{ value: false, label: '不需要' }, { value: true, label: '需要复诊' }]}
          value={form.needsFollowUp}
          onChange={v => set('needsFollowUp', v === true || v === 'true')}
        />
      </div>

      {form.needsFollowUp && (
        <div className="form-group">
          <label className="form-label">复诊日期</label>
          <input type="date" className="form-input" value={form.followUpDate} onChange={e => set('followUpDate', e.target.value)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>
          {isEdit ? '保存修改' : '添加记录'}
        </button>
      </div>
    </div>
  )
}
