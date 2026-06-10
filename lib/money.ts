export function parsePriceToCents(price: string): number {
  const n = Number.parseFloat(price.replace(/[^0-9.]/g, ""))
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 100)
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function computeLineTotalCents(lines: { qty: number; price: string }[]): number {
  return lines.reduce((sum, line) => sum + parsePriceToCents(line.price) * line.qty, 0)
}

export function getPlatformFeeCents(totalCents: number): number {
  const percent = Number.parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? "0")
  if (!Number.isFinite(percent) || percent <= 0) return 0
  return Math.min(Math.floor((totalCents * percent) / 100), totalCents - 50)
}
