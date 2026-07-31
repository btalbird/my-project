export type CartLine = {
  menuItemId: number
  name: string
  qty: number
  price: string
}

export type CartState = {
  restaurantId: number
  restaurantName: string
  lines: CartLine[]
}

const CART_KEY_PREFIX = "munch-cart"
const LEGACY_CART_KEY = "munch-cart"
export const CART_UPDATED_EVENT = "munch-cart-updated"

function cartStorageKey(userId: string | null | undefined): string | null {
  if (!userId) return null
  return `${CART_KEY_PREFIX}:${userId}`
}

function notifyCartUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

function removeLegacyCart() {
  if (typeof window === "undefined") return
  localStorage.removeItem(LEGACY_CART_KEY)
}

export function getCartItemCount(userId: string | null | undefined): number {
  const cart = readCart(userId)
  if (!cart) return 0
  return cart.lines.reduce((sum, line) => sum + line.qty, 0)
}

export function readCart(userId: string | null | undefined): CartState | null {
  if (!userId || typeof window === "undefined") return null

  removeLegacyCart()

  const key = cartStorageKey(userId)
  if (!key) return null

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CartState
    if (!parsed?.restaurantId || !Array.isArray(parsed.lines)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeCart(userId: string | null | undefined, cart: CartState | null) {
  if (!userId || typeof window === "undefined") return

  const key = cartStorageKey(userId)
  if (!key) return

  if (!cart || cart.lines.length === 0) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, JSON.stringify(cart))
  }
  notifyCartUpdated()
}

export function addToCart(
  userId: string | null | undefined,
  restaurantId: number,
  restaurantName: string,
  item: { id: number; name: string; priceCents: number },
) {
  if (!userId) {
    return { ok: false as const, reason: "sign_in_required" as const }
  }

  const price = `$${(item.priceCents / 100).toFixed(2)}`
  const existing = readCart(userId)

  if (existing && existing.restaurantId !== restaurantId) {
    return { ok: false as const, reason: "different_restaurant" as const }
  }

  const lines = existing?.lines ?? []
  const idx = lines.findIndex((l) => l.menuItemId === item.id)
  if (idx >= 0) {
    lines[idx] = { ...lines[idx]!, qty: lines[idx]!.qty + 1 }
  } else {
    lines.push({ menuItemId: item.id, name: item.name, qty: 1, price })
  }

  const next = { restaurantId, restaurantName, lines }
  writeCart(userId, next)
  return { ok: true as const, cart: next }
}

export function updateCartLineQty(userId: string | null | undefined, menuItemId: number, qty: number) {
  const cart = readCart(userId)
  if (!cart) return null
  const lines =
    qty <= 0
      ? cart.lines.filter((l) => l.menuItemId !== menuItemId)
      : cart.lines.map((l) => (l.menuItemId === menuItemId ? { ...l, qty } : l))
  const next = { ...cart, lines }
  writeCart(userId, lines.length > 0 ? next : null)
  return lines.length > 0 ? next : null
}

export function clearCart(userId: string | null | undefined) {
  writeCart(userId, null)
}
