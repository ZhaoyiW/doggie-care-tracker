import { useParams, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import useStore from '../store'
import { formatDateFull } from '../utils/dateUtils'
import { POOP_STATUS_MAP, FOOD_TYPES } from '../constants'
import { computePoopLabel, getPoopEventsForDate } from '../utils/poopLabelEngine'

const FOOD_TYPE_MAP = Object.fromEntries(FOOD_TYPES.map(f => [f.value, f.label]))
const SPIRIT_MAP = { NORMAL: '正常', SLIGHTLY_LOW: '稍差', VERY_LOW: '很差' }
const APPETITE_MAP = { NORMAL: '正常', FAIR: '一般', POOR: '差' }
const WATER_MAP = { NORMAL: '正常', MORE: '偏多', LESS: '偏少' }

export default function DayDetail() {
  const { date } = useParams()
  const navigate = useNavigate()
  const foodLogs = useStore(s => s.foodLogs)
  const poopLogs = useStore(s => s.poopLogs || [])
  const symptomLogs = useStore(s => s.symptomLogs)

  const dayFoods = useMemo(() =>
    foodLogs.filter(f => f.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [foodLogs, date])

  const dayPoops = useMemo(() =>
    getPoopEventsForDate(poopLogs, date).sort((a, b) => a.time.localeCompare(b.time)),
    [poopLogs, date])

  const daySymptom = useMemo(() =>
    symptomLogs.find(s => s.date === date), [symptomLogs, date])

  const poopLabel = useMemo(() => computePoopLabel(dayPoops), [dayPoops])

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-icon" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{formatDateFull(date)}</h1>
      </div>

      {/* Poop summary */}
      {poopLabel.key !== 'NONE' && (
        <div className="card" style={{ background: poopLabel.bg, border: `1.5px solid ${poopLabel.color}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>💩</span>
            <div>
              <span style={{ fontWeight: 700, color: poopLabel.color, fontSize: 16 }}>{poopLabel.label}</span>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>共 {dayPoops.length} 次排便</div>
            </div>
          </div>
        </div>
      )}

      {/* Food logs */}
      {dayFoods.length > 0 && (
        <div className="card">
          <p className="card-title">🍚 饮食记录</p>
          {dayFoods.map(f => (
            <div key={f.id} className="record-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{FOOD_TYPE_MAP[f.foodType] || f.foodType}{f.content && ` · ${f.content}`}</div>
                <div className="record-meta">{f.time}{f.amount && ` · ${f.amount}`} · {f.finished ? '✅ 吃完' : '🤏 未完'}{f.notes && ` · ${f.notes}`}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poop logs */}
      {dayPoops.length > 0 && (
        <div className="card">
          <p className="card-title">💩 排便记录</p>
          {dayPoops.map(p => {
            const status = POOP_STATUS_MAP[p.status]
            return (
              <div key={p.id} className="poop-pill">
                <span>{status?.emoji || '💩'}</span>
                <span style={{ flex: 1, fontSize: 13 }}>
                  {p.time} · <span style={{ color: status?.color, fontWeight: 600 }}>{status?.label}</span>
                  {p.hasMucus && ' · 黏液'}
                  {p.hasBlood && ' · 有血'}
                  {p.onlyDrips && ' · 滴水'}
                  {p.notes && ` · ${p.notes}`}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Symptom */}
      {daySymptom && (
        <div className="card">
          <p className="card-title">📋 每日状态</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['精神', SPIRIT_MAP[daySymptom.spirit]],
              ['食欲', APPETITE_MAP[daySymptom.appetite]],
              ['饮水', WATER_MAP[daySymptom.water]],
              ['呕吐', daySymptom.vomiting === 'YES' ? '⚠️ 有' : '无'],
              daySymptom.weight && ['体重', `${daySymptom.weight}lb`],
            ].filter(Boolean).map(([label, val]) => (
              <div key={label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{val}</div>
              </div>
            ))}
          </div>
          {daySymptom.notes && <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>{daySymptom.notes}</div>}
        </div>
      )}

      {dayFoods.length === 0 && dayPoops.length === 0 && !daySymptom && (
        <div className="empty-state">
          <div className="empty-emoji">📭</div>
          <p>当天暂无记录</p>
        </div>
      )}
    </div>
  )
}
