import { TIME_SLOTS } from '../constants'

export default function TimePicker({ value, onChange, label = '时间' }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select
        className="form-input form-select"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {TIME_SLOTS.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
