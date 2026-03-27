import { useState, useMemo } from 'react'
import useStore from '../store'
import Modal from '../components/Modal'
import FoodLogForm from '../components/forms/FoodLogForm'
import PoopLogForm from '../components/forms/PoopLogForm'
import SymptomLogForm from '../components/forms/SymptomLogForm'
import DogProfileForm from '../components/forms/DogProfileForm'
import { today, formatDate, daysBetween } from '../utils/dateUtils'
import { computePoopLabel, getPoopEventsForDate } from '../utils/poopLabelEngine'
import { POOP_STATUS_MAP, FOOD_TYPES } from '../constants'

function ReminderCard({ title, items }) {
  if (items.length === 0) return null
  return (
    <div className="card">
      <p className="card-title">{title}</p>
      {items.map(item => {
        const cls = item.days < 0 ? 'overdue' : item.days <= 30 ? 'soon' : 'ok'
        const label = item.days < 0 ? `已过期 ${-item.days} 天` : item.days === 0 ? '今天到期' : `${item.days} 天后到期`
        return (
          <div key={item.id} className={`vaccine-alert ${cls}`}>
            <span style={{ flex: 1 }}>
              <strong>{item.name}</strong><br />
              <span style={{ fontSize: 12, opacity: 0.8 }}>{formatDate(item.nextDueDate)} · {label}</span>
            </span>
            <span style={{ fontSize: 18 }}>{cls === 'overdue' ? '🚨' : cls === 'soon' ? '⚠️' : '✅'}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Dashboard() {
  const dogProfile = useStore(s => s.dogProfile)
  const poopLogs = useStore(s => s.poopLogs || [])
  const foodLogs = useStore(s => s.foodLogs)
  const symptomLogs = useStore(s => s.symptomLogs)
  const vaccineRecords = useStore(s => s.vaccineRecords)
  const dewormingRecords = useStore(s => s.dewormingRecords || [])
  const vetVisits = useStore(s => s.vetVisits)
  const bathLogs = useStore(s => s.bathLogs || [])

  const [modal, setModal] = useState(null)

  const todayStr = today()

  const todayPoops = useMemo(() =>
    getPoopEventsForDate(poopLogs, todayStr), [poopLogs, todayStr])

  const poopLabel = useMemo(() =>
    computePoopLabel(todayPoops), [todayPoops])

  const todayFoodCount = useMemo(() =>
    foodLogs.filter(f => f.date === todayStr).length, [foodLogs, todayStr])

  const todaySymptom = useMemo(() =>
    symptomLogs.find(s => s.date === todayStr), [symptomLogs, todayStr])

  const lastPoop = useMemo(() =>
    [...poopLogs].sort((a, b) =>
      b.date.localeCompare(a.date) || b.time.localeCompare(a.time)
    )[0],
    [poopLogs])

  const hoursSinceLastPoop = useMemo(() => {
    if (!lastPoop) return null
    const last = new Date(`${lastPoop.date}T${lastPoop.time}:00`)
    return (Date.now() - last.getTime()) / 3600000
  }, [lastPoop])

  const last30DaysLoose = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    return poopLogs.filter(p => p.date >= cutoffStr && p.status === 'LOOSE').length
  }, [poopLogs])

  const lastVetVisit = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 60)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    return [...vetVisits]
      .filter(v => v.date >= cutoffStr)
      .sort((a, b) => b.date.localeCompare(a.date))[0]
  }, [vetVisits])

  const lastBath = useMemo(() =>
    [...bathLogs].sort((a, b) => b.date.localeCompare(a.date))[0],
    [bathLogs])

  const vaccineReminders = useMemo(() =>
    vaccineRecords
      .filter(v => v.nextDueDate)
      .map(v => ({ ...v, days: daysBetween(todayStr, v.nextDueDate) }))
      .filter(v => v.days <= 60)
      .sort((a, b) => a.days - b.days),
    [vaccineRecords, todayStr])

  const dewormingReminders = useMemo(() =>
    dewormingRecords
      .filter(r => r.nextDueDate)
      .map(r => ({ ...r, days: daysBetween(todayStr, r.nextDueDate) }))
      .filter(r => r.days <= 5)
      .sort((a, b) => a.days - b.days),
    [dewormingRecords, todayStr])

  return (
    <div className="page-content">
      {/* Dog profile */}
      <div className="card" style={{ marginBottom: 16, cursor: 'pointer' }} onClick={() => setModal('profile')}>
        <div className="dog-profile">
          <div className="dog-avatar" style={{ overflow: 'hidden' }}>
            {dogProfile?.avatarImage
              ? <img src={dogProfile.avatarImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              : dogProfile?.avatarEmoji || '🐶'
            }
          </div>
          <div style={{ flex: 1 }}>
            <p className="dog-name">{dogProfile?.name || '我的狗狗'}</p>
            <p className="dog-meta">
              {dogProfile?.breed || ''}
              {dogProfile?.weight ? ` · ${dogProfile.weight}kg` : ''}
            </p>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: 18 }}>✏️</span>
        </div>
      </div>

      {/* Quick add */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { emoji: '🍚', label: '喂食', modal: 'food' },
          { emoji: '💩', label: '排便', modal: 'poop' },
          { emoji: '📋', label: '日状态', modal: 'symptom' },
        ].map(item => (
          <button key={item.modal} className="quick-add-btn" onClick={() => setModal(item.modal)}>
            <span className="emoji">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Today summary */}
      <div className="card">
        <p className="card-title">📊 今日概览</p>
        <div className="stat-row">
          <div className="stat-item">
            <div className="stat-num">{todayFoodCount}</div>
            <div className="stat-label">喂食次数</div>
          </div>
          <div className="stat-item">
            <div className="stat-num">{todayPoops.length}</div>
            <div className="stat-label">排便次数</div>
          </div>
        </div>
        {todayPoops.length > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 10, background: poopLabel.bg }}>
            <span style={{ color: poopLabel.color, fontWeight: 700 }}>
              今日排便：{poopLabel.label}
            </span>
          </div>
        )}
        {todaySymptom && (
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
            精神：{todaySymptom.spirit === 'NORMAL' ? '正常' : todaySymptom.spirit === 'SLIGHTLY_LOW' ? '稍差' : '很差'} ·
            食欲：{todaySymptom.appetite === 'NORMAL' ? '正常' : todaySymptom.appetite === 'FAIR' ? '一般' : '差'}
          </div>
        )}
      </div>

      {/* Last poop */}
      {lastPoop && (
        <div className="card">
          <p className="card-title">💩 最近排便</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{POOP_STATUS_MAP[lastPoop.status]?.emoji || '💩'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{POOP_STATUS_MAP[lastPoop.status]?.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {formatDate(lastPoop.date)} {lastPoop.time}
                {lastPoop.hasMucus && ' · 有黏液'}
                {lastPoop.hasBlood && ' · 有血'}
              </div>
            </div>
            {hoursSinceLastPoop !== null && (
              <div style={{
                textAlign: 'center',
                padding: '4px 10px',
                borderRadius: 8,
                background: hoursSinceLastPoop >= 15 ? '#F5E8E8' : 'var(--bg)',
                color: hoursSinceLastPoop >= 15 ? 'var(--red)' : 'var(--muted)',
                fontWeight: hoursSinceLastPoop >= 15 ? 700 : 400,
              }}>
                <div style={{ fontSize: 15 }}>{Math.floor(hoursSinceLastPoop)}h</div>
                <div style={{ fontSize: 11 }}>{hoursSinceLastPoop >= 15 ? '⚠️ 注意' : '距今'}</div>
              </div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--muted)' }}>
            近30天拉稀 <strong style={{ color: last30DaysLoose > 3 ? 'var(--red)' : 'var(--text)' }}>{last30DaysLoose}</strong> 次
          </div>
        </div>
      )}

      {/* Vaccine & deworming reminders */}
      <ReminderCard title="💉 疫苗提醒" items={vaccineReminders} />
      <ReminderCard title="💊 驱虫提醒" items={dewormingReminders} />

      {/* Last bath */}
      {lastBath && (
        <div className="card">
          <p className="card-title">🛁 最近洗澡</p>
          <div style={{ fontSize: 14 }}>
            {formatDate(lastBath.date)}
            <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--muted)' }}>
              · {daysBetween(lastBath.date, todayStr) === 0 ? '今天' : `${daysBetween(lastBath.date, todayStr)} 天前`}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {lastBath.location === 'OUTSIDE'
              ? `🏪 ${lastBath.shopName || '在外'}`
              : '🏠 在家'}
            {lastBath.notes && ` · ${lastBath.notes}`}
          </div>
        </div>
      )}

      {/* Last vet visit */}
      {lastVetVisit && (
        <div className="card">
          <p className="card-title">🏥 最近就医</p>
          <div style={{ fontWeight: 600 }}>{lastVetVisit.hospital}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            {formatDate(lastVetVisit.date)} · {lastVetVisit.reason}
          </div>
          {lastVetVisit.diagnosis && (
            <div style={{ fontSize: 13, marginTop: 4 }}>诊断：{lastVetVisit.diagnosis}</div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={modal === 'profile'} onClose={() => setModal(null)} title="🐶 编辑狗狗信息">
        <DogProfileForm onClose={() => setModal(null)} />
      </Modal>
      <Modal open={modal === 'food'} onClose={() => setModal(null)} title="🍚 添加喂食记录">
        <FoodLogForm date={todayStr} onClose={() => setModal(null)} />
      </Modal>
      <Modal open={modal === 'poop'} onClose={() => setModal(null)} title="💩 添加排便记录">
        <PoopLogForm date={todayStr} onClose={() => setModal(null)} />
      </Modal>
      <Modal open={modal === 'symptom'} onClose={() => setModal(null)} title="📋 每日状态">
        <SymptomLogForm date={todayStr} onClose={() => setModal(null)} />
      </Modal>
    </div>
  )
}
