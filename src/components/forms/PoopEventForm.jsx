import { useState } from 'react'
import { POOP_STATUS, getCurrentHalfHour } from '../../constants'
import TimePicker from '../TimePicker'
import Segmented from '../Segmented'

export default function PoopEventForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    time: initial?.time ?? getCurrentHalfHour(),
    status: initial?.status ?? 'NORMAL',
    hasMucus: initial?.hasMucus ?? false,
    hasBlood: initial?.hasBlood ?? false,
    onlyDrips: initial?.onlyDrips ?? false,
    notes: initial?.notes ?? '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  return (
    <div className="poop-form-inline">
      <TimePicker value={form.time} onChange={v => set('time', v)} label="排便时间" />

      <div className="form-group">
        <label className="form-label">排便状态</label>
        <Segmented
          options={POOP_STATUS}
          value={form.status}
          onChange={v => set('status', v)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">附加情况</label>
        <div>
          {[
            { key: 'hasMucus', label: '有黏液' },
            { key: 'hasBlood', label: '有血' },
            { key: 'onlyDrips', label: '只有滴水' },
          ].map(({ key, label }) => (
            <label key={key} className="toggle-row" style={{ cursor: 'pointer' }}>
              <span className="toggle-label">{label}</span>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={e => set(key, e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">备注</label>
        <textarea
          className="form-input form-textarea"
          style={{ minHeight: 56 }}
          placeholder="可选..."
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onCancel}>
          取消
        </button>
        <button className="btn btn-primary btn-sm" style={{ flex: 2 }} onClick={() => onSave(form)}>
          保存
        </button>
      </div>
    </div>
  )
}
