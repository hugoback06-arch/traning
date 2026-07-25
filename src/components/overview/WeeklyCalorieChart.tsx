import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { DayKcal } from '../../hooks/useWeeklyMealTotals'

interface WeeklyCalorieChartProps {
  days: DayKcal[]
  goalKcal: number
}

const WIDTH = 300
const HEIGHT = 88
const PADDING_X = 4
const PADDING_Y = 10
const BAR_GAP = 6

export function WeeklyCalorieChart({ days, goalKcal }: WeeklyCalorieChartProps) {
  const today = days[days.length - 1]?.date
  const [selected, setSelected] = useState<DayKcal | null>(null)
  const active = selected ?? (today ? days.find((d) => isSameDay(d.date, today)) ?? null : null)

  const maxKcal = Math.max(goalKcal, ...days.map((d) => d.kcal), 1)
  const barWidth = (WIDTH - PADDING_X * 2 - BAR_GAP * (days.length - 1)) / days.length

  function yFor(kcal: number) {
    return HEIGHT - PADDING_Y - (kcal / maxKcal) * (HEIGHT - PADDING_Y * 2)
  }

  const goalY = goalKcal > 0 ? yFor(goalKcal) : null

  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-secondary">Senaste 7 dagarna</p>
        {active && (
          <p className="text-xs font-medium text-ink-primary">
            {Math.round(active.kcal)} kcal{' '}
            <span className="text-ink-secondary">· {format(active.date, 'EEEE d MMM', { locale: sv })}</span>
          </p>
        )}
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="mt-1.5 w-full">
        <line
          x1={PADDING_X}
          y1={HEIGHT - PADDING_Y}
          x2={WIDTH - PADDING_X}
          y2={HEIGHT - PADDING_Y}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        {goalY !== null && (
          <line
            x1={PADDING_X}
            y1={goalY}
            x2={WIDTH - PADDING_X}
            y2={goalY}
            stroke="var(--color-ink-secondary)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
        {days.map((day, i) => {
          const x = PADDING_X + i * (barWidth + BAR_GAP)
          const y = yFor(day.kcal)
          const overGoal = goalKcal > 0 && day.kcal > goalKcal
          const isActive = active && isSameDay(day.date, active.date)
          return (
            <g key={day.date.getTime()} className="cursor-pointer" onClick={() => setSelected(day)}>
              <rect x={x} y={PADDING_Y} width={barWidth} height={HEIGHT - PADDING_Y * 2} fill="transparent" />
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(HEIGHT - PADDING_Y - y, 1)}
                rx={2}
                fill={overGoal ? 'var(--color-warning)' : 'var(--color-accent)'}
                opacity={isActive ? 1 : 0.55}
              />
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-ink-secondary">
        {days.map((day) => (
          <button
            key={day.date.getTime()}
            onClick={() => setSelected(day)}
            className={`flex-1 text-center ${active && isSameDay(day.date, active.date) ? 'font-semibold text-ink-primary' : ''}`}
          >
            {format(day.date, 'EEEEE', { locale: sv })}
          </button>
        ))}
      </div>
    </div>
  )
}
