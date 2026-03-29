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
  const [expanded, setExpanded] = useState(false)
  if (items.length === 0) return null

  // urgency based on the most urgent item
  const minDays = Math.min(...items.map(i => i.days))
  const urgency = minDays < 0 ? 'overdue' : minDays <= 30 ? 'soon' : 'ok'
  const cardBg = urgency === 'overdue' ? '#F5E8E8' : urgency === 'soon' ? '#F5EEE3' : '#EAF0EA'
  const cardColor = urgency === 'overdue' ? 'var(--red)' : urgency === 'soon' ? 'var(--orange)' : 'var(--green)'
  const icon = urgency === 'overdue' ? '🚨' : urgency === 'soon' ? '⚠️' : '✅'

  const summary = minDays < 0
    ? `${items.length} 个疫苗已过期`
    : minDays === 0
    ? `${items.length} 个疫苗今天到期`
    : `${items.length} 个疫苗 ${minDays} 天后到期`

  return (
    <div className="card" style={{ background: cardBg, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: cardColor }}>{title.replace(/^..\s/, '')}</div>
            <div style={{ fontSize: 12, color: cardColor, opacity: 0.85 }}>{summary}</div>
          </div>
        </div>
        <span style={{ fontSize: 12, color: cardColor, opacity: 0.7 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }} onClick={e => e.stopPropagation()}>
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
      )}
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
  const appointments = useStore(s => s.appointments || [])
  const vets = useStore(s => s.vets || [])

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

  const upcomingAppointments = useMemo(() => {
    const vetMap = Object.fromEntries(vets.map(v => [v.id, v]))
    return appointments
      .filter(a => a.status === 'PENDING' && a.date >= todayStr)
      .map(a => ({ ...a, vet: a.vetId ? vetMap[a.vetId] : null, days: daysBetween(todayStr, a.date) }))
      .filter(a => a.days <= 30)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }, [appointments, vets, todayStr])

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

      {/* Upcoming appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="card">
          <p className="card-title">📅 近期预约</p>
          {upcomingAppointments.map(apt => (
            <div key={apt.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{apt.reason || '预约'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {formatDate(apt.date)} {apt.time}
                  {apt.vet && ` · ${apt.vet.name}`}
                </div>
                {apt.vet?.address && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>📍 {apt.vet.address}</div>
                )}
                {apt.vet?.address && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <a
                      href={`https://maps.apple.com/?address=${encodeURIComponent(apt.vet.address)}`}
                      style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', padding: '3px 8px', background: 'var(--bg)', borderRadius: 6 }}
                    >
                      🍎 Apple Maps
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.vet.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', padding: '3px 8px', background: 'var(--bg)', borderRadius: 6 }}
                    >
                      🗺 Google Maps
                    </a>
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                background: apt.days === 0 ? '#F5EEE3' : '#EEF1F5',
                color: apt.days === 0 ? 'var(--orange)' : 'var(--accent)',
              }}>
                {apt.days === 0 ? '今天' : `${apt.days}天后`}
              </span>
            </div>
          ))}
        </div>
      )}

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
