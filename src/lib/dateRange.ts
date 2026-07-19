import { addDays, startOfDay } from 'date-fns'

export function dayRangeIso(date: Date) {
  const start = startOfDay(date)
  const end = addDays(start, 1)
  return { startIso: start.toISOString(), endIsoExclusive: end.toISOString() }
}
