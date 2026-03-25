import { subDays, format } from 'date-fns'

function d(daysAgo) {
  return format(subDays(new Date(), daysAgo), 'yyyy-MM-dd')
}

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export const sampleDogProfile = {
  id: 'dog_jovi',
  name: 'Jovi',
  breed: 'Cavapoo',
  birthDate: '2021-06-15',
  weight: 8.2,
  avatarEmoji: '🐶',
}

export function generateSampleData() {
  const poopLogs = []
  const foodLogs = []
  const symptomLogs = []

  // daysAgo, [{ time, status }], foodFinished, spirit
  const scenarios = [
    [14, [{ time: '08:00', status: 'NORMAL' }, { time: '17:30', status: 'NORMAL' }], true, 'NORMAL'],
    [13, [{ time: '08:00', status: 'NORMAL' }, { time: '17:00', status: 'NORMAL' }], true, 'NORMAL'],
    [12, [{ time: '07:30', status: 'SOFT'   }, { time: '17:30', status: 'NORMAL' }], true, 'NORMAL'],
    [11, [{ time: '08:00', status: 'LOOSE'  }, { time: '12:00', status: 'LOOSE'  }], false, 'SLIGHTLY_LOW'],
    [10, [{ time: '08:00', status: 'SOFT'   }, { time: '17:00', status: 'SOFT'   }], true, 'SLIGHTLY_LOW'],
    [9,  [{ time: '08:00', status: 'NORMAL' }, { time: '17:30', status: 'NORMAL' }], true, 'NORMAL'],
    [8,  [{ time: '07:30', status: 'NORMAL' }, { time: '17:00', status: 'NORMAL' }], true, 'NORMAL'],
    [7,  [{ time: '08:00', status: 'CONSTIPATED' }],                                 true, 'NORMAL'],
    [6,  [{ time: '08:00', status: 'NORMAL' }, { time: '17:30', status: 'NORMAL' }], true, 'NORMAL'],
    [5,  [{ time: '08:00', status: 'LOOSE'  }],                                      false, 'SLIGHTLY_LOW'],
    [4,  [{ time: '08:00', status: 'SOFT'   }, { time: '17:00', status: 'NORMAL' }], true, 'NORMAL'],
    [3,  [{ time: '07:30', status: 'NORMAL' }, { time: '17:30', status: 'NORMAL' }], true, 'NORMAL'],
    [2,  [{ time: '08:00', status: 'NORMAL' }, { time: '17:00', status: 'NORMAL' }], true, 'NORMAL'],
    [1,  [{ time: '08:00', status: 'NORMAL' }, { time: '17:30', status: 'SOFT'   }], true, 'NORMAL'],
  ]

  scenarios.forEach(([daysAgo, poops, foodFinished, spirit]) => {
    const dateStr = d(daysAgo)

    poops.forEach(({ time, status }) => {
      poopLogs.push({
        id: uid('poop'),
        date: dateStr,
        time,
        status,
        hasMucus: status === 'LOOSE',
        hasBlood: false,
        onlyDrips: false,
        notes: '',
      })
    })

    foodLogs.push({
      id: uid('food'),
      date: dateStr,
      time: '07:00',
      items: [{ type: 'PRESCRIPTION', content: '皇家处方粮', amount: '100g' }],
      finished: foodFinished,
      notes: '',
    })

    foodLogs.push({
      id: uid('food'),
      date: dateStr,
      time: '18:00',
      items: [{ type: 'PRESCRIPTION', content: '皇家处方粮', amount: '100g' }],
      finished: true,
      notes: '',
    })

    symptomLogs.push({
      id: uid('symptom'),
      date: dateStr,
      spirit,
      appetite: foodFinished ? 'NORMAL' : 'POOR',
      vomiting: 'NONE',
      water: 'NORMAL',
      weight: daysAgo === 7 ? 8.2 : undefined,
      notes: '',
    })
  })

  const vaccineRecords = [
    {
      id: uid('vaccine'),
      name: '狂犬病疫苗',
      date: '2025-03-01',
      nextDueDate: '2026-03-01',
      hospital: '爱宠动物医院',
      notes: '',
    },
    {
      id: uid('vaccine'),
      name: '犬八联疫苗',
      date: '2025-09-15',
      nextDueDate: '2026-09-15',
      hospital: '爱宠动物医院',
      notes: '第3针',
    },
  ]

  const vetVisits = [
    {
      id: uid('vet'),
      date: d(11),
      hospital: '爱宠动物医院',
      doctor: '王医生',
      reason: '拉稀、食欲不振',
      diagnosis: '急性肠胃炎',
      treatment: '禁食12小时，补液',
      medications: '益生菌、蒙脱石散',
      summary: '应激反应引起，建议2周后复查',
      needsFollowUp: false,
      followUpDate: '',
    },
  ]

  const healthTests = [
    {
      id: uid('test'),
      date: d(11),
      type: 'BLOOD',
      summary: '常规血检',
      isNormal: true,
      details: '白细胞稍高，其余正常',
    },
    {
      id: uid('test'),
      date: d(11),
      type: 'STOOL',
      summary: '便检',
      isNormal: false,
      details: '检出少量寄生虫卵，已开驱虫药',
    },
  ]

  return { poopLogs, foodLogs, symptomLogs, vaccineRecords, vetVisits, healthTests }
}
