import { useState, useRef } from 'react'
import useStore from '../../store'

export default function DogProfileForm({ onClose }) {
  const dogProfile = useStore(s => s.dogProfile)
  const setDogProfile = useStore(s => s.setDogProfile)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: dogProfile?.name ?? '',
    breed: dogProfile?.breed ?? '',
    birthDate: dogProfile?.birthDate ?? '',
    weight: dogProfile?.weight ?? '',
    avatarEmoji: dogProfile?.avatarEmoji ?? '🐶',
    avatarImage: dogProfile?.avatarImage ?? null,
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => set('avatarImage', ev.target.result)
    reader.readAsDataURL(file)
  }

  function submit() {
    setDogProfile({
      id: dogProfile?.id ?? 'dog_1',
      ...form,
      weight: form.weight ? parseFloat(form.weight) : undefined,
    })
    onClose()
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">头像</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Preview */}
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            overflow: 'hidden', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)', flexShrink: 0,
          }}>
            {form.avatarImage
              ? <img src={form.avatarImage} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 36 }}>{form.avatarEmoji}</span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 上传图片
            </button>
            {form.avatarImage && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--red)', fontSize: 12 }}
                onClick={() => set('avatarImage', null)}
              >
                移除图片
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>

      <div className="form-group">
        <label className="form-label">名字</label>
        <input type="text" className="form-input" placeholder="狗狗的名字" value={form.name} onChange={e => set('name', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">品种</label>
        <input type="text" className="form-input" placeholder="例：Cavapoo" value={form.breed} onChange={e => set('breed', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">生日</label>
        <input type="date" className="form-input" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">体重（kg）</label>
        <input type="number" step="0.1" className="form-input" placeholder="例：8.2" value={form.weight} onChange={e => set('weight', e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>取消</button>
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={submit}>保存</button>
      </div>
    </div>
  )
}
