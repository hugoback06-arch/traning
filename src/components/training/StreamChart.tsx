import { useRef, useState } from 'react'

interface StreamChartProps {
  label: string
  colorVar: string
  timeSeconds: number[]
  values: number[]
  formatValue: (v: number) => string
  formatTime: (t: number) => string
}

const WIDTH = 300
const HEIGHT = 88
const PADDING_X = 4
const PADDING_Y = 10

// Single-metric line (puls OR tempo, never both on one axis — two different
// scales on one chart is the classic dual-axis mistake) with a hover
// crosshair+tooltip, per the dataviz skill's interaction guidance.
export function StreamChart({ label, colorVar, timeSeconds, values, formatValue, formatTime }: StreamChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const range = maxV - minV || 1
  const maxT = timeSeconds[timeSeconds.length - 1] || 1

  function xFor(t: number) {
    return PADDING_X + (t / maxT) * (WIDTH - PADDING_X * 2)
  }
  function yFor(v: number) {
    return HEIGHT - PADDING_Y - ((v - minV) / range) * (HEIGHT - PADDING_Y * 2)
  }

  const path = timeSeconds.map((t, i) => `${i === 0 ? 'M' : 'L'} ${xFor(t).toFixed(1)} ${yFor(values[i]).toFixed(1)}`).join(' ')

  function handlePointer(clientX: number) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const relX = ((clientX - rect.left) / rect.width) * WIDTH
    const t = ((relX - PADDING_X) / (WIDTH - PADDING_X * 2)) * maxT
    let closest = 0
    let closestDiff = Infinity
    for (let i = 0; i < timeSeconds.length; i++) {
      const diff = Math.abs(timeSeconds[i] - t)
      if (diff < closestDiff) {
        closestDiff = diff
        closest = i
      }
    }
    setHoverIndex(closest)
  }

  const active = hoverIndex ?? timeSeconds.length - 1

  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-secondary">{label}</p>
        <p className="text-xs font-medium text-ink-primary">
          {formatValue(values[active])} <span className="text-ink-secondary">· {formatTime(timeSeconds[active])}</span>
        </p>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-1.5 w-full touch-none"
        onPointerMove={(e) => handlePointer(e.clientX)}
        onPointerDown={(e) => handlePointer(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <line
          x1={PADDING_X}
          y1={HEIGHT - PADDING_Y}
          x2={WIDTH - PADDING_X}
          y2={HEIGHT - PADDING_Y}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <path d={path} fill="none" stroke={colorVar} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {hoverIndex !== null && (
          <>
            <line
              x1={xFor(timeSeconds[hoverIndex])}
              y1={PADDING_Y}
              x2={xFor(timeSeconds[hoverIndex])}
              y2={HEIGHT - PADDING_Y}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <circle cx={xFor(timeSeconds[hoverIndex])} cy={yFor(values[hoverIndex])} r={3} fill={colorVar} />
          </>
        )}
      </svg>
    </div>
  )
}
