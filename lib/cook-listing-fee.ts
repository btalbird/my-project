import { getListingPriceId, getStripe } from "@/lib/stripe"

export type CookListingFee = {
  label: string
  amountCents: number
  currency: string
  interval: string
}

const DEFAULT_FEE_CENTS = 2900

function formatListingFee(amountCents: number, currency: string, interval: string): CookListingFee {
  const normalized = currency.toLowerCase()
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: normalized,
  }).format(amountCents / 100)
  const intervalLabel = interval === "month" ? "month" : interval
  return {
    label: `${formatted}/${intervalLabel}`,
    amountCents,
    currency: normalized,
    interval,
  }
}

function fallbackListingFee(): CookListingFee {
  const cents = Number(process.env.COOK_LISTING_FEE_CENTS)
  const amountCents = Number.isFinite(cents) && cents > 0 ? cents : DEFAULT_FEE_CENTS
  return formatListingFee(amountCents, "usd", "month")
}

export async function getCookListingFee(): Promise<CookListingFee> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return fallbackListingFee()
  }

  try {
    const priceId = getListingPriceId()
    const stripe = getStripe()
    const price = await stripe.prices.retrieve(priceId)
    const amountCents = price.unit_amount ?? fallbackListingFee().amountCents
    const currency = price.currency || "usd"
    const interval = price.recurring?.interval ?? "month"
    return formatListingFee(amountCents, currency, interval)
  } catch {
    return fallbackListingFee()
  }
}
