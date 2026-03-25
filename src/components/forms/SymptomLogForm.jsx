import { useState } from 'react'
import { SPIRIT_LEVELS, APPETITE_LEVELS, WATER_LEVELS } from '../../constants'
import { today } from '../../utils/dateUtils'
import Segmented from '../Segmented'
import useStore from '../../store'

export default function SymptomLogForm({ initial, date, onClose }) {
  const addSymptomLog = useStore(s => s.addSymptomLog)
  const updateSymptomLog = useStore(s => s.updateSymptomLog)
  const isEdit = !!initial

  const [form, setForm] = useState({
    date: initial?.date ?? date ?? today(),
    spirit: initial?.spirit ?? 'NORMAL',
    appetite: initial?.appetite ?? 'NORMAL',
    vomiting: initial?.vomiting ?? 'NONE',
    water: initial?.water ?? 'NORMAL',
    weight: initial?.weight ?? '',
    notes: initial?.notes ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function submit() {
    const data = { ...form, weight: form.weight ? parseFloat(form.weight) : undefined }
    if (isEdit) {
      updateSymptomLog(initial.id, data)
    } else {
      addSymptomLog(data)
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
          onChange={e => set('date', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">精神状态</label>
        <Segmented options={SPIRIT_LEVELS} value={form.spirit} onChange={v => set('spirit', v)} />
      </div>

      <div className="form-group">
        <label className="form-label">食欲</label>
        <Segmented options={APPETITE_LEVELS} value={form.appetite} onChange={v => set('appetite', v)} />
      </div>

      <div className="form-group">
        <label className="form-label">是否呕吐</label>
        <Segmented
          options={[{ value: 'NONE', label: '无' }, { value: 'YES', label: '有' }]}
          value={form.vomiting}
          onChange={v => set('vomiting', v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">饮水情况</label>
        <Segmented options={WATER_LEVELS} value={form.water} onChange={v => set('water', v)} />
      </div>

      <div className="form-group">
        <label className="form-label">体重（kg，可选）</label>
        <input
          type="number"
          step="0.1"
          className="form-input"
          placeholder="例：18.5"
          value={form.weight}
          onChange={e => set('weight', e.target.value)}
        />
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
