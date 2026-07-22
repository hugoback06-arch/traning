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
  frequentFoodItems: (userId: string | undefined) => ['meal-logs', 'frequent', userId] as const,

  workoutsInRange: (userId: string | undefined, startIso: string, endIsoExclusive: string) =>
    ['workouts', 'range', startIso, endIsoExclusive, userId] as const,
  planSessionsInRange: (userId: string | undefined, startDate: string, endDate: string) =>
    ['plan-sessions', 'range', startDate, endDate, userId] as const,
  activeTrainingPlan: (userId: string | undefined) => ['training-plans', 'active', userId] as const,
  workoutHistory: (userId: string | undefined) => ['workouts', 'history', userId] as const,
  workoutDetail: (workoutId: string | undefined) => ['workouts', 'detail', workoutId] as const,
  workoutsPrefix: ['workouts'] as const,
  planSessionsPrefix: ['plan-sessions'] as const,
}
