import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from 'date-fns'
import { sv } from 'date-fns/locale'

export function weekDays(referenceDate: Date): Date[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

export function nextWeek(date: Date): Date {
  return addWeeks(date, 1)
}

export function prevWeek(date: Date): Date {
  return subWeeks(date, 1)
}

export function weekRangeLabel(referenceDate: Date): string {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
  const sameMonth = start.getMonth() === end.getMonth()
  const startLabel = format(start, sameMonth ? 'd' : 'd MMM', { locale: sv })
  const endLabel = format(end, 'd MMM', { locale: sv })
  return `${startLabel}–${endLabel}`
}
