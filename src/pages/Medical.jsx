import { useState, useMemo } from 'react'
import useStore from '../store'
import Modal from '../components/Modal'
import VaccineForm from '../components/forms/VaccineForm'
import VetVisitForm from '../components/forms/VetVisitForm'
import HealthTestForm from '../components/forms/HealthTestForm'
import DewormingForm from '../components/forms/DewormingForm'
import { formatDate, today, daysBetween } from '../utils/dateUtils'
import { HEALTH_TEST_TYPES } from '../constants'

const TEST_TYPE_MAP = Object.fromEntries(HEALTH_TEST_TYPES.map(t => [t.value, t.label]))

const TABS = ['💉 疫苗', '🏥 就医', '🧪 检查', '💊 驱虫']

function VaccineList({ records, onEdit, onDelete }) {
  const todayStr = today()
  if (records.length === 0) return <div className="empty-state"><div className="empty-emoji">💉</div><p>暂无疫苗记录</p></div>
  return records
    .sort((a, b) => (a.nextDueDate || '').localeCompare(b.nextDueDate || ''))
    .map(v => {
      const days = v.nextDueDate ? daysBetween(todayStr, v.nextDueDate) : null
      const cls = days === null ? 'ok' : days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'ok'
      return (
        <div key={v.id} className="record-item">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{v.name}</div>
            <div className="record-meta">
              接种：{formatDate(v.date)}
              {v.nextDueDate && ` · 到期：${formatDate(v.nextDueDate)}`}
              {days !== null && (
                <span style={{ marginLeft: 6, color: cls === 'overdue' ? 'var(--red)' : cls === 'soon' ? 'var(--orange)' : 'var(--green)', fontWeight: 600, fontSize: 11 }}>
                  {days < 0 ? `过期${-days}天` : days === 0 ? '今天到期' : `${days}天后`}
                </span>
              )}
            </div>
            {v.hospital && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{v.hospital}</div>}
            {v.notes && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{v.notes}</div>}
          </div>
          <div className="record-actions">
            <button className="btn btn-icon" onClick={() => onEdit(v)}>✏️</button>
            <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(v.id)}>🗑</button>
          </div>
        </div>
      )
    })
}

function VetList({ records, onEdit, onDelete }) {
  if (records.length === 0) return <div className="empty-state"><div className="empty-emoji">🏥</div><p>暂无就医记录</p></div>
  return records
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(v => (
      <div key={v.id} className="card" style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{v.hospital}{v.doctor && ` · ${v.doctor}`}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{formatDate(v.date)}</div>
          </div>
          <div className="record-actions">
            <button className="btn btn-icon" onClick={() => onEdit(v)}>✏️</button>
            <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(v.id)}>🗑</button>
          </div>
        </div>
        {v.reason && <div style={{ fontSize: 13, marginTop: 8 }}>原因：{v.reason}</div>}
        {v.diagnosis && <div style={{ fontSize: 13 }}>诊断：{v.diagnosis}</div>}
        {v.medications && <div style={{ fontSize: 13 }}>药物：{v.medications}</div>}
        {v.needsFollowUp && v.followUpDate && (
          <div style={{ marginTop: 6, padding: '4px 8px', background: 'var(--bg)', borderRadius: 6, fontSize: 12, color: 'var(--orange)' }}>
            📅 复诊：{formatDate(v.followUpDate)}
          </div>
        )}
      </div>
    ))
}

function TestList({ records, onEdit, onDelete }) {
  if (records.length === 0) return <div className="empty-state"><div className="empty-emoji">🧪</div><p>暂无检查记录</p></div>
  return records
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => (
      <div key={t.id} className="record-item">
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            {TEST_TYPE_MAP[t.type] || t.type} · {t.summary}
            <span style={{
              fontSize: 11, padding: '1px 6px', borderRadius: 4, fontWeight: 700,
              background: t.isNormal ? 'var(--green)20' : 'var(--red)20',
              color: t.isNormal ? 'var(--green)' : 'var(--red)'
            }}>
              {t.isNormal ? '正常' : '异常'}
            </span>
          </div>
          <div className="record-meta">{formatDate(t.date)}</div>
          {t.details && <div style={{ fontSize: 13, marginTop: 4 }}>{t.details}</div>}
        </div>
        <div className="record-actions">
          <button className="btn btn-icon" onClick={() => onEdit(t)}>✏️</button>
          <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(t.id)}>🗑</button>
        </div>
      </div>
    ))
}

function DewormingList({ records, onEdit, onDelete }) {
  const todayStr = today()
  if (records.length === 0) return <div className="empty-state"><div className="empty-emoji">💊</div><p>暂无驱虫记录</p></div>
  return records
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(r => {
      const days = r.nextDueDate ? daysBetween(todayStr, r.nextDueDate) : null
      const cls = days === null ? 'ok' : days < 0 ? 'overdue' : days <= 30 ? 'soon' : 'ok'
      return (
        <div key={r.id} className="record-item">
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div className="record-meta">
              用药：{formatDate(r.date)}
              {r.nextDueDate && ` · 下次：${formatDate(r.nextDueDate)}`}
              {days !== null && (
                <span style={{ marginLeft: 6, color: cls === 'overdue' ? 'var(--red)' : cls === 'soon' ? 'var(--orange)' : 'var(--green)', fontWeight: 600, fontSize: 11 }}>
                  {days < 0 ? `过期${-days}天` : days === 0 ? '今天到期' : `${days}天后`}
                </span>
              )}
            </div>
            {r.notes && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{r.notes}</div>}
          </div>
          <div className="record-actions">
            <button className="btn btn-icon" onClick={() => onEdit(r)}>✏️</button>
            <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => onDelete(r.id)}>🗑</button>
          </div>
        </div>
      )
    })
}

export default function Medical() {
  const [tab, setTab] = useState(0)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const vaccineRecords = useStore(s => s.vaccineRecords)
  const vetVisits = useStore(s => s.vetVisits)
  const healthTests = useStore(s => s.healthTests)
  const dewormingRecords = useStore(s => s.dewormingRecords || [])
  const deleteVaccineRecord = useStore(s => s.deleteVaccineRecord)
  const deleteVetVisit = useStore(s => s.deleteVetVisit)
  const deleteHealthTest = useStore(s => s.deleteHealthTest)
  const deleteDewormingRecord = useStore(s => s.deleteDewormingRecord)

  function openEdit(item) {
    setEditing(item)
    setModal(true)
  }

  function openAdd() {
    setEditing(null)
    setModal(true)
  }

  function closeModal() {
    setModal(false)
    setEditing(null)
  }

  const modalTitle = [
    editing ? '✏️ 编辑疫苗' : '💉 添加疫苗',
    editing ? '✏️ 编辑就医' : '🏥 添加就医',
    editing ? '✏️ 编辑检查' : '🧪 添加检查',
    editing ? '✏️ 编辑驱虫' : '💊 添加驱虫',
  ][tab]

  return (
    <div className="page-content">
      <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 700 }}>医疗记录</h1>

      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={t} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {tab === 0 && <VaccineList records={vaccineRecords} onEdit={openEdit} onDelete={deleteVaccineRecord} />}
      {tab === 1 && <VetList records={vetVisits} onEdit={openEdit} onDelete={deleteVetVisit} />}
      {tab === 2 && <TestList records={healthTests} onEdit={openEdit} onDelete={deleteHealthTest} />}
      {tab === 3 && <DewormingList records={dewormingRecords} onEdit={openEdit} onDelete={deleteDewormingRecord} />}

      <button className="fab" onClick={openAdd}>+</button>

      <Modal open={modal} onClose={closeModal} title={modalTitle}>
        {tab === 0 && <VaccineForm initial={editing} onClose={closeModal} />}
        {tab === 1 && <VetVisitForm initial={editing} onClose={closeModal} />}
        {tab === 2 && <HealthTestForm initial={editing} onClose={closeModal} />}
        {tab === 3 && <DewormingForm initial={editing} onClose={closeModal} />}
      </Modal>
    </div>
  )
}
