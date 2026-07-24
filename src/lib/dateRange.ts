import { addDays, startOfDay } from 'date-fns'

export function dayRangeIso(date: Date) {
  const start = startOfDay(date)
  const end = addDays(start, 1)
  return { startIso: start.toISOString(), endIsoExclusive: end.toISOString() }
}

/** Range covering today and the 6 preceding days (7 days total). */
export function lastNDaysRangeIso(date: Date, days: number) {
  const start = startOfDay(addDays(date, -(days - 1)))
  const end = addDays(startOfDay(date), 1)
  return { startIso: start.toISOString(), endIsoExclusive: end.toISOString() }
}
