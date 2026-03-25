export default function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`segmented-btn ${value === opt.value ? 'selected' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.emoji && <span>{opt.emoji} </span>}
          {opt.label}
        </button>
      ))}
    </div>
  )
}
