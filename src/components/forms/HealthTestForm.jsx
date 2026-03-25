import { useState } from 'react'
import { HEALTH_TEST_TYPES } from '../../constants'
import { today } from '../../utils/dateUtils'
import Segmented from '../Segmented'
import useStore from '../../store'

export default function HealthTestForm({ initial, onClose }) {
  const addHealthTest = useStore(s => s.addHealthTest)
  const updateHealthTest = useStore(s => s.updateHealthTest)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? today(),
    type: initial?.type ?? 'BLOOD',
    summary: initial?.summary ?? '',
    isNormal: initial?.isNormal ?? true,
    details: initial?.details ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    if (isEdit) updateHealthTest(initial.id, form)
    else addHealthTest(form)
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">检查日期</label>
        <input type="date" className="form-input" value={form.date} onChange={e => set('date', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">检查类型</label>
        <Segmented options={HEALTH_TEST_TYPES} value={form.type} onChange={v => set('type', v)} />
      </div>

      <div className="form-group">
        <label className="form-label">结果摘要</label>
        <input type="text" className="form-input" placeholder="例：常规血检" value={form.summary} onChange={e => set('summary', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">是否正常</label>
        <Segmented
          options={[{ value: true, label: '✅ 正常' }, { value: false, label: '⚠️ 异常' }]}
          value={form.isNormal}
          onChange={v => set('isNormal', v === true || v === 'true')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">详细说明</label>
        <textarea className="form-input form-textarea" placeholder="详细结果描述..." value={form.details} onChange={e => set('details', e.target.value)} />
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
