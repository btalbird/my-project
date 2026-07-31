export const COOK_SIGNIN_PATH = "/for-cooks/signin"

const COOK_PORTAL_PREFIXES = [
  "/for-cooks/cook-dashboard",
  "/for-cooks/kitchen",
  "/for-cooks/orders",
  "/for-cooks/menu",
  "/for-cooks/earnings",
  "/for-cooks/stripe-products",
] as const

export function isCookPortalPath(pathname: string): boolean {
  return COOK_PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export function cookSignInUrl(nextPath: string): string {
  return `${COOK_SIGNIN_PATH}?next=${encodeURIComponent(nextPath)}`
}
