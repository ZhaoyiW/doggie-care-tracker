import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store'
import Modal from '../components/Modal'
import VetForm from '../components/forms/VetForm'

export default function VetManager() {
  const navigate = useNavigate()
  const vets = useStore(s => s.vets || [])
  const deleteVet = useStore(s => s.deleteVet)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  function openAdd() {
    setEditing(null)
    setModal(true)
  }

  function openEdit(vet) {
    setEditing(vet)
    setModal(true)
  }

  function closeModal() {
    setModal(false)
    setEditing(null)
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-icon" onClick={() => navigate(-1)}>←</button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>🏥 常用诊所</h1>
      </div>

      {vets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🏥</div>
          <p>暂无诊所，点击 + 添加</p>
        </div>
      ) : (
        vets.map(vet => (
          <div key={vet.id} className="card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{vet.name}</div>
                {vet.address && (
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>📍 {vet.address}</div>
                )}
                {vet.phone && (
                  <a
                    href={`tel:${vet.phone}`}
                    style={{ fontSize: 13, color: 'var(--accent)', marginTop: 2, display: 'block', textDecoration: 'none' }}
                  >
                    📞 {vet.phone}
                  </a>
                )}
                {vet.note && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{vet.note}</div>
                )}
              </div>
              <div className="record-actions">
                <button className="btn btn-icon" onClick={() => openEdit(vet)}>✏️</button>
                <button className="btn btn-icon" style={{ color: 'var(--red)' }} onClick={() => deleteVet(vet.id)}>🗑</button>
              </div>
            </div>
          </div>
        ))
      )}

      <button className="fab" onClick={openAdd}>+</button>

      <Modal open={modal} onClose={closeModal} title={editing ? '✏️ 编辑诊所' : '🏥 添加诊所'}>
        <VetForm initial={editing} onClose={closeModal} />
      </Modal>
    </div>
  )
}
