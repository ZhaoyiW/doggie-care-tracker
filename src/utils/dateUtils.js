import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, subDays, addMonths, subMonths } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function today() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return format(parseISO(dateStr), 'MM月dd日', { locale: zhCN })
}

export function formatDateFull(dateStr) {
  if (!dateStr) return ''
  return format(parseISO(dateStr), 'yyyy年MM月dd日', { locale: zhCN })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  return format(parseISO(dateStr), 'M/d')
}

export function formatMonthYear(date) {
  return format(date, 'yyyy年MM月', { locale: zhCN })
}

export function getDaysInMonth(date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return eachDayOfInterval({ start, end })
}

export function getMonthStartWeekday(date) {
  return getDay(startOfMonth(date)) // 0=Sun, 6=Sat
}

export function isDateToday(dateStr) {
  return isToday(parseISO(dateStr))
}

export function getLast30Days() {
  const result = []
  for (let i = 29; i >= 0; i--) {
    result.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return result
}

export function nextMonth(date) {
  return addMonths(date, 1)
}

export function prevMonth(date) {
  return subMonths(date, 1)
}

export function dateToDayStr(date) {
  return format(date, 'yyyy-MM-dd')
}

export function parseDate(dateStr) {
  return parseISO(dateStr)
}

export function daysBetween(dateStr1, dateStr2) {
  const d1 = parseISO(dateStr1)
  const d2 = parseISO(dateStr2)
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24))
}

export function isSameDateStr(d1, d2) {
  return d1 === d2
}
