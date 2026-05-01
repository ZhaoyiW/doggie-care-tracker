import { useState } from 'react'
import { today } from '../../utils/dateUtils'
import DatePicker from '../DatePicker'
import useStore from '../../store'

export default function VaccineForm({ initial, onClose }) {
  const addVaccineRecord = useStore(s => s.addVaccineRecord)
  const updateVaccineRecord = useStore(s => s.updateVaccineRecord)
  const vets = useStore(s => s.vets || [])
  const isEdit = !!initial

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    date: initial?.date ?? today(),
    nextDueDate: initial?.nextDueDate ?? '',
    hospital: initial?.hospital ?? '',
    notes: initial?.notes ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updateVaccineRecord(initial.id, form)
    else addVaccineRecord(form)
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">疫苗名称</label>
        <input type="text" className="form-input" placeholder="例：狂犬病疫苗" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">接种日期</label>
        <DatePicker variant="input" value={form.date} onChange={v => set('date', v)} />
      </div>

      <div className="form-group">
        <label className="form-label">下次到期日</label>
        <DatePicker variant="input" value={form.nextDueDate} onChange={v => set('nextDueDate', v)} placeholder="选择到期日" />
      </div>

      <div className="form-group">
        <label className="form-label">接种医院</label>
        {vets.length > 0 ? (
          <select className="form-input" value={form.hospital} onChange={e => set('hospital', e.target.value)}>
            <option value="">请选择诊所</option>
            {vets.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
            <option value="__custom__">其他（手动输入）</option>
          </select>
        ) : null}
        {(vets.length === 0 || form.hospital === '__custom__' || (form.hospital && !vets.some(v => v.name === form.hospital))) && (
          <input type="text" className="form-input" style={vets.length > 0 ? { marginTop: 8 } : {}} placeholder="医院名称" value={form.hospital === '__custom__' ? '' : form.hospital} onChange={e => set('hospital', e.target.value)} />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea className="form-input form-textarea" placeholder="可选..." value={form.notes} onChange={e => set('notes', e.target.value)} />
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
