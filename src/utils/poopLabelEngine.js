import { LABEL_COLORS } from '../constants'

/**
 * Compute the poop label for a given day based on all poop logs for that date
 */
export function computePoopLabel(poopEvents) {
  if (!poopEvents || poopEvents.length === 0) {
    return { key: 'NONE', ...LABEL_COLORS.NONE }
  }

  if (poopEvents.some(e => e.status === 'LOOSE')) {
    return { key: 'LOOSE', ...LABEL_COLORS.LOOSE }
  }

  if (poopEvents.length < 2 || poopEvents.some(e => e.status === 'CONSTIPATED')) {
    return { key: 'CONSTIPATED', ...LABEL_COLORS.CONSTIPATED }
  }

  return { key: 'NORMAL', ...LABEL_COLORS.NORMAL }
}

/**
 * Get all poop logs for a given date from the flat poopLogs array
 */
export function getPoopEventsForDate(poopLogs, dateStr) {
  return (poopLogs || []).filter(p => p.date === dateStr)
}

/**
 * Compute poop label for a date, treating past days with no records as CONSTIPATED
 * if they fall on or after the earliest data date.
 */
export function computePoopLabelForDay(poopLogs, dateStr, firstDataDate, todayStr) {
  const events = getPoopEventsForDate(poopLogs, dateStr)
  if (events.length === 0 && firstDataDate && dateStr >= firstDataDate && dateStr < todayStr) {
    return { key: 'CONSTIPATED', ...LABEL_COLORS.CONSTIPATED }
  }
  return computePoopLabel(events)
}
