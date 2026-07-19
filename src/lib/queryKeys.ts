export const queryKeys = {
  profile: (userId: string | undefined) => ['profile', userId] as const,
  todayMealLogs: (userId: string | undefined) => ['meal-logs', 'today', userId] as const,
  todayWater: (userId: string | undefined) => ['water-logs', 'today', userId] as const,
  mealLogDates: (userId: string | undefined) => ['meal-logs', 'dates', userId] as const,
  mealLogsForDate: (userId: string | undefined, dateKey: string) =>
    ['meal-logs', 'date', dateKey, userId] as const,
  mealLogDatesInRange: (userId: string | undefined, startIso: string, endIsoExclusive: string) =>
    ['meal-logs', 'range', startIso, endIsoExclusive, userId] as const,
  mealLogsPrefix: ['meal-logs'] as const,
}
