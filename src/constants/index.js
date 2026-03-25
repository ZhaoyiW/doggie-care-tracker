// Half-hour time slots
export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
})

// Get current time rounded down to nearest half hour
export function getCurrentHalfHour() {
  const now = new Date()
  const m = now.getMinutes() >= 30 ? '30' : '00'
  return `${String(now.getHours()).padStart(2, '0')}:${m}`
}

// Food types
export const FOOD_TYPES = [
  { value: 'PRESCRIPTION', label: '处方粮' },
  { value: 'CHICKEN_RICE', label: '鸡肉米饭' },
  { value: 'PROBIOTIC', label: '益生菌' },
  { value: 'OTHER', label: '其他' },
]

// Poop status
export const POOP_STATUS = [
  { value: 'NORMAL', label: '正常', emoji: '✅', color: '#8FAF8F' },
  { value: 'HARD', label: '硬便', emoji: '🟤', color: '#A0826D' },
  { value: 'SOFT', label: '软便', emoji: '🟡', color: '#C9B99A' },
  { value: 'LOOSE', label: '拉稀', emoji: '💧', color: '#C08080' },
  { value: 'CONSTIPATED', label: '没拉出来', emoji: '😣', color: '#C9A87A' },
]

export const POOP_STATUS_MAP = Object.fromEntries(POOP_STATUS.map(s => [s.value, s]))

// Calendar label colors (Morandi palette)
export const LABEL_COLORS = {
  LOOSE: { label: '拉稀', color: '#C08080', bg: '#F5E8E8' },
  CONSTIPATED: { label: '便秘', color: '#C9A87A', bg: '#F5EEE3' },
  NORMAL: { label: '正常', color: '#8FAF8F', bg: '#EAF0EA' },
  NONE: { label: '无记录', color: '#B0ABA5', bg: '#F0EEEC' },
}

// Spirit levels
export const SPIRIT_LEVELS = [
  { value: 'NORMAL', label: '正常' },
  { value: 'SLIGHTLY_LOW', label: '稍差' },
  { value: 'VERY_LOW', label: '很差' },
]

// Appetite levels
export const APPETITE_LEVELS = [
  { value: 'NORMAL', label: '正常' },
  { value: 'FAIR', label: '一般' },
  { value: 'POOR', label: '差' },
]

// Water levels
export const WATER_LEVELS = [
  { value: 'NORMAL', label: '正常' },
  { value: 'MORE', label: '偏多' },
  { value: 'LESS', label: '偏少' },
]

// Health test types
export const HEALTH_TEST_TYPES = [
  { value: 'BLOOD', label: '血检' },
  { value: 'STOOL', label: '便检' },
  { value: 'URINE', label: '尿检' },
  { value: 'XRAY', label: 'X光' },
  { value: 'ULTRASOUND', label: '超声' },
  { value: 'OTHER', label: '其他' },
]

export const MORANDI = {
  green: '#8FAF8F',
  yellow: '#C9B99A',
  red: '#C08080',
  orange: '#C9A87A',
  gray: '#B0ABA5',
  bg: '#F5F0EB',
  card: '#FDFAF7',
  text: '#4A4540',
  muted: '#8A8480',
  accent: '#9FAFC0',
  border: '#E8E2DC',
}
