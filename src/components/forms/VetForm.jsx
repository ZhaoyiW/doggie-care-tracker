import { useState } from 'react'
import useStore from '../../store'

export default function VetForm({ initial, onClose }) {
  const addVet = useStore(s => s.addVet)
  const updateVet = useStore(s => s.updateVet)
  const isEdit = !!initial

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    note: initial?.note ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (!form.name.trim()) return
    if (isEdit) updateVet(initial.id, form)
    else addVet(form)
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">诊所名称 *</label>
        <input type="text" className="form-input" placeholder="例：爱宠动物医院" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">地址</label>
        <input type="text" className="form-input" placeholder="详细地址" value={form.address} onChange={e => set('address', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">电话</label>
        <input type="tel" className="form-input" placeholder="联系电话" value={form.phone} onChange={e => set('phone', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea className="form-input form-textarea" placeholder="医生姓名、特殊说明等" value={form.note} onChange={e => set('note', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>
          {isEdit ? '保存修改' : '添加诊所'}
        </button>
      </div>
    </div>
  )
}
