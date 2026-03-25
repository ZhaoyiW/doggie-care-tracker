import { create } from 'zustand'

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── API helpers ───────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL ?? ''

const api = {
  post: (path, body) =>
    fetch(`${BASE}/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(e => console.error('API error:', e)),

  put: (path, body) =>
    fetch(`${BASE}/api/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(e => console.error('API error:', e)),

  del: (path) =>
    fetch(`${BASE}/api/${path}`, { method: 'DELETE' })
      .catch(e => console.error('API error:', e)),
}

const useStore = create((set) => ({
  loading: true,

  // ─── Load all data from server ─────────────────────────────────────────
  loadAll: async () => {
    set({ loading: true })
    const data = await fetch(`${BASE}/api/all`).then(r => r.json()).catch(() => null)
    if (data) {
      set({
        dogProfile:       data.dogProfile ?? null,
        foodLogs:         data.foodLogs ?? [],
        poopLogs:         data.poopLogs ?? [],
        symptomLogs:      data.symptomLogs ?? [],
        vaccineRecords:   data.vaccineRecords ?? [],
        vetVisits:        data.vetVisits ?? [],
        healthTests:      data.healthTests ?? [],
        dewormingRecords: data.dewormingRecords ?? [],
        bathLogs:         data.bathLogs ?? [],
      })
    }
    set({ loading: false })
  },

  // ─── Dog Profile ───────────────────────────────────────────────────────
  dogProfile: null,

  setDogProfile: async (profile) => {
    set({ dogProfile: profile })
    const res = await fetch(`${BASE}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('保存头像失败:', err)
      alert('头像保存失败，图片可能太大，请压缩后重试')
    }
  },

  // ─── Food Logs ─────────────────────────────────────────────────────────
  foodLogs: [],

  addFoodLog: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ foodLogs: [record, ...s.foodLogs] }))
    api.post('food-logs', record)
  },
  updateFoodLog: (id, data) => {
    set(s => ({ foodLogs: s.foodLogs.map(f => f.id === id ? { ...f, ...data } : f) }))
    api.put(`food-logs/${id}`, data)
  },
  deleteFoodLog: (id) => {
    set(s => ({ foodLogs: s.foodLogs.filter(f => f.id !== id) }))
    api.del(`food-logs/${id}`)
  },

  // ─── Poop Logs ─────────────────────────────────────────────────────────
  poopLogs: [],

  addPoopLog: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ poopLogs: [record, ...s.poopLogs] }))
    api.post('poop-logs', record)
  },
  updatePoopLog: (id, data) => {
    set(s => ({ poopLogs: s.poopLogs.map(p => p.id === id ? { ...p, ...data } : p) }))
    api.put(`poop-logs/${id}`, data)
  },
  deletePoopLog: (id) => {
    set(s => ({ poopLogs: s.poopLogs.filter(p => p.id !== id) }))
    api.del(`poop-logs/${id}`)
  },

  // ─── Symptom Logs ──────────────────────────────────────────────────────
  symptomLogs: [],

  addSymptomLog: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ symptomLogs: [record, ...s.symptomLogs] }))
    api.post('symptom-logs', record)
  },
  updateSymptomLog: (id, data) => {
    set(s => ({ symptomLogs: s.symptomLogs.map(sl => sl.id === id ? { ...sl, ...data } : sl) }))
    api.put(`symptom-logs/${id}`, data)
  },
  deleteSymptomLog: (id) => {
    set(s => ({ symptomLogs: s.symptomLogs.filter(sl => sl.id !== id) }))
    api.del(`symptom-logs/${id}`)
  },

  // ─── Vaccine Records ───────────────────────────────────────────────────
  vaccineRecords: [],

  addVaccineRecord: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ vaccineRecords: [record, ...s.vaccineRecords] }))
    api.post('vaccine-records', record)
  },
  updateVaccineRecord: (id, data) => {
    set(s => ({ vaccineRecords: s.vaccineRecords.map(v => v.id === id ? { ...v, ...data } : v) }))
    api.put(`vaccine-records/${id}`, data)
  },
  deleteVaccineRecord: (id) => {
    set(s => ({ vaccineRecords: s.vaccineRecords.filter(v => v.id !== id) }))
    api.del(`vaccine-records/${id}`)
  },

  // ─── Vet Visits ────────────────────────────────────────────────────────
  vetVisits: [],

  addVetVisit: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ vetVisits: [record, ...s.vetVisits] }))
    api.post('vet-visits', record)
  },
  updateVetVisit: (id, data) => {
    set(s => ({ vetVisits: s.vetVisits.map(v => v.id === id ? { ...v, ...data } : v) }))
    api.put(`vet-visits/${id}`, data)
  },
  deleteVetVisit: (id) => {
    set(s => ({ vetVisits: s.vetVisits.filter(v => v.id !== id) }))
    api.del(`vet-visits/${id}`)
  },

  // ─── Health Tests ──────────────────────────────────────────────────────
  healthTests: [],

  addHealthTest: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ healthTests: [record, ...s.healthTests] }))
    api.post('health-tests', record)
  },
  updateHealthTest: (id, data) => {
    set(s => ({ healthTests: s.healthTests.map(t => t.id === id ? { ...t, ...data } : t) }))
    api.put(`health-tests/${id}`, data)
  },
  deleteHealthTest: (id) => {
    set(s => ({ healthTests: s.healthTests.filter(t => t.id !== id) }))
    api.del(`health-tests/${id}`)
  },

  // ─── Deworming Records ─────────────────────────────────────────────────
  dewormingRecords: [],

  addDewormingRecord: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ dewormingRecords: [record, ...s.dewormingRecords] }))
    api.post('deworming-records', record)
  },
  updateDewormingRecord: (id, data) => {
    set(s => ({ dewormingRecords: s.dewormingRecords.map(r => r.id === id ? { ...r, ...data } : r) }))
    api.put(`deworming-records/${id}`, data)
  },
  deleteDewormingRecord: (id) => {
    set(s => ({ dewormingRecords: s.dewormingRecords.filter(r => r.id !== id) }))
    api.del(`deworming-records/${id}`)
  },

  // ─── Bath Logs ─────────────────────────────────────────────────────────
  bathLogs: [],

  addBathLog: (data) => {
    const record = { id: uid(), ...data }
    set(s => ({ bathLogs: [record, ...s.bathLogs] }))
    api.post('bath-logs', record)
  },
  updateBathLog: (id, data) => {
    set(s => ({ bathLogs: s.bathLogs.map(b => b.id === id ? { ...b, ...data } : b) }))
    api.put(`bath-logs/${id}`, data)
  },
  deleteBathLog: (id) => {
    set(s => ({ bathLogs: s.bathLogs.filter(b => b.id !== id) }))
    api.del(`bath-logs/${id}`)
  },
}))

export default useStore
