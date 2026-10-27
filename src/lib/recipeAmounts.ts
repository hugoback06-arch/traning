// Recipe amounts are free text from Claude ("2 dl", "1/2 st", "1,5 msk",
// "2–3 klyftor", "en nypa"). Scaling only touches a leading number or range
// and leaves anything else ("efter smak") as written.
const FRACTIONS: Record<string, number> = { '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3 }
const NUMBER = String.raw`(\d+(?:[.,]\d+)?(?:\/\d+)?|[½¼¾⅓⅔])`
const LEADING_AMOUNT = new RegExp(String.raw`^${NUMBER}(?:\s*[-–]\s*${NUMBER})?`)

function parseNumber(text: string): number {
  if (text in FRACTIONS) return FRACTIONS[text]
  if (text.includes('/')) {
    const [numerator, denominator] = text.split('/').map(Number)
    return denominator ? numerator / denominator : numerator
  }
  return Number(text.replace(',', '.'))
}

function formatNumber(value: number, rest: string): string {
  const unit = rest.trim().toLowerCase()
  if (/^(g|gram|ml)\b/.test(unit) && value >= 100) return String(Math.round(value / 5) * 5)
  if (value >= 10) return String(Math.round(value))
  const rounded = Math.round(value * 2) / 2
  if (rounded === 0) return '½'
  const whole = Math.floor(rounded)
  if (rounded - whole === 0.5) return whole === 0 ? '½' : `${whole} ½`
  return String(rounded)
}

export function scaleAmount(amount: string, factor: number): string {
  if (factor === 1) return amount
  const trimmed = amount.trim()
  const match = LEADING_AMOUNT.exec(trimmed)
  if (!match) return amount
  const rest = trimmed.slice(match[0].length)
  const from = formatNumber(parseNumber(match[1]) * factor, rest)
  const to = match[2] ? `–${formatNumber(parseNumber(match[2]) * factor, rest)}` : ''
  return `${from}${to}${rest}`
}
