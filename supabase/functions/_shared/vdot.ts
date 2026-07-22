// Jack Daniels & Jimmy Gilbert's VDOT formulas (Daniels' Running Formula) —
// converts a recent race/time-trial result into precise training paces,
// instead of guessing paces from casual training-run history. Verified
// against published reference points (VDOT 50 ≈ 5K 19:57 / marathon 3:10:49,
// VDOT 40 ≈ 5K 24:08 / 10K 50:03) before wiring in.
function velocityToVO2(metersPerMin: number): number {
  return -4.6 + 0.182258 * metersPerMin + 0.000104 * metersPerMin * metersPerMin
}

function percentVO2Max(minutes: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * minutes) + 0.2989558 * Math.exp(-0.1932605 * minutes)
}

// Inverts the velocity→VO2 quadratic to solve for velocity given a target VO2.
function vo2ToVelocity(vo2: number): number {
  const a = 0.000104
  const b = 0.182258
  const c = -(4.6 + vo2)
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}

function formatPace(minPerKm: number): string {
  const min = Math.floor(minPerKm)
  const sec = Math.round((minPerKm - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')}/km`
}

export interface VdotPaces {
  vdot: number
  easyPace: string
  marathonPace: string
  thresholdPace: string
  intervalPace: string
  repetitionPace: string
}

// %VO2max targets per Daniels' training-intensity zones.
const PACE_ZONES = {
  easyPace: 0.7,
  marathonPace: 0.82,
  thresholdPace: 0.88,
  intervalPace: 0.98,
  repetitionPace: 1.08,
} as const

export function computeVdotPaces(distanceKm: number, timeSeconds: number): VdotPaces | null {
  if (distanceKm <= 0 || timeSeconds <= 0) return null

  const minutes = timeSeconds / 60
  const metersPerMin = (distanceKm * 1000) / minutes
  const vo2 = velocityToVO2(metersPerMin)
  const pct = percentVO2Max(minutes)
  const vdot = vo2 / pct
  if (!Number.isFinite(vdot) || vdot <= 0) return null

  const paceAt = (percent: number) => formatPace(1000 / vo2ToVelocity(percent * vdot))

  return {
    vdot: Math.round(vdot * 10) / 10,
    easyPace: paceAt(PACE_ZONES.easyPace),
    marathonPace: paceAt(PACE_ZONES.marathonPace),
    thresholdPace: paceAt(PACE_ZONES.thresholdPace),
    intervalPace: paceAt(PACE_ZONES.intervalPace),
    repetitionPace: paceAt(PACE_ZONES.repetitionPace),
  }
}
