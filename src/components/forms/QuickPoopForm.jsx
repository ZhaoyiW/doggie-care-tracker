import { useState } from 'react'
import { POOP_STATUS, getCurrentHalfHour } from '../../constants'
import { today } from '../../utils/dateUtils'
import TimePicker from '../TimePicker'
import useStore from '../../store'

export default function QuickPoopForm({ onClose }) {
  const quickAddPoop = useStore(s => s.quickAddPoop)
  const [status, setStatus] = useState('NORMAL')
  const [time, setTime] = useState(getCurrentHalfHour())
  const [showMore, setShowMore] = useState(false)
  const [hasMucus, setHasMucus] = useState(false)
  const [hasBlood, setHasBlood] = useState(false)
  const [onlyDrips, setOnlyDrips] = useState(false)
  const [notes, setNotes] = useState('')

  function submit() {
    quickAddPoop(today(), { time, status, hasMucus, hasBlood, onlyDrips, notes })
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">排便状态</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 4 }}>
          {POOP_STATUS.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              style={{
                padding: '14px 8px',
                borderRadius: 14,
                border: `2px solid ${status === s.value ? s.color : 'var(--border)'}`,
                background: status === s.value ? s.color + '22' : 'var(--bg)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 15,
                fontWeight: status === s.value ? 700 : 400,
                color: status === s.value ? s.color : 'var(--text)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <TimePicker value={time} onChange={setTime} label="时间" />

      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 12, padding: 0 }}
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? '▲ 收起详情' : '▼ 更多选项'}
      </button>

      {showMore && (
        <div>
          {[
            { key: 'hasMucus', label: '有黏液', val: hasMucus, set: setHasMucus },
            { key: 'hasBlood', label: '有血', val: hasBlood, set: setHasBlood },
            { key: 'onlyDrips', label: '只有滴水', val: onlyDrips, set: setOnlyDrips },
          ].map(({ key, label, val, set }) => (
            <label key={key} className="toggle-row" style={{ cursor: 'pointer' }}>
              <span className="toggle-label">{label}</span>
              <label className="toggle">
                <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </label>
          ))}

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">备注</label>
            <textarea
              className="form-input form-textarea"
              style={{ minHeight: 56 }}
              placeholder="可选..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>
          💾 快速保存
        </button>
      </div>
    </div>
  )
}
