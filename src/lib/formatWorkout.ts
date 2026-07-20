export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds) return null
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (hours > 0) return `${hours} h ${minutes} min`
  return `${minutes} min`
}

export function formatDistance(meters: number | null | undefined): string | null {
  if (!meters) return null
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`
}

export function formatPace(meters: number | null | undefined, seconds: number | null | undefined): string | null {
  if (!meters || !seconds) return null
  const km = meters / 1000
  const secPerKm = seconds / km
  const min = Math.floor(secPerKm / 60)
  const sec = Math.round(secPerKm % 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}
