import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { checkRateLimit } from "@/lib/rate-limit"
import { isCookPortalPath, COOK_SIGNIN_PATH } from "@/lib/cook-portal-paths"
import { SESSION_COOKIE } from "@/lib/session"
import { parseSessionToken } from "@/lib/session-token"

function needsAuth(pathname: string) {
  if (pathname === "/orders" || pathname.startsWith("/orders/")) return true
  if (pathname === "/member" || pathname.startsWith("/member/")) return true
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true
  if (isCookPortalPath(pathname)) return true
  return false
}

function rateLimitKey(req: NextRequest): { key: string; limit: number; windowMs: number } | null {
  const { pathname } = req.nextUrl
  const method = req.method
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"

  if (method === "POST" && pathname === "/api/auth/login") {
    return { key: `login:${ip}`, limit: 10, windowMs: 60_000 }
  }
  if (method === "POST" && (pathname === "/api/auth/signup" || pathname === "/api/auth/signup-cook")) {
    return { key: `signup:${ip}`, limit: 5, windowMs: 60_000 }
  }
  if (method === "GET" && pathname === "/api/address/autocomplete") {
    return { key: `autocomplete:${ip}`, limit: 60, windowMs: 60_000 }
  }
  if (method === "POST" && pathname === "/api/webhooks/stripe-connect") {
    return { key: `stripe-connect-webhook:${ip}`, limit: 120, windowMs: 60_000 }
  }
  if (method === "POST" && pathname === "/api/webhooks/stripe") {
    return { key: `stripe-webhook:${ip}`, limit: 120, windowMs: 60_000 }
  }
  return null
}

export async function middleware(req: NextRequest) {
  const rate = rateLimitKey(req)
  if (rate) {
    const result = checkRateLimit(rate.key, rate.limit, rate.windowMs)
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSec) },
        },
      )
    }
  }

  if (!needsAuth(req.nextUrl.pathname)) return NextResponse.next()

  const raw = req.cookies.get(SESSION_COOKIE)?.value
  const uid = raw ? await parseSessionToken(raw) : null
  if (!uid) {
    const url = req.nextUrl.clone()
    const returnPath = `${req.nextUrl.pathname}${req.nextUrl.search}`
    url.pathname = isCookPortalPath(req.nextUrl.pathname) ? COOK_SIGNIN_PATH : "/signin"
    url.searchParams.set("next", returnPath)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/orders",
    "/orders/:path*",
    "/member",
    "/member/:path*",
    "/admin",
    "/admin/:path*",
    "/for-cooks/cook-dashboard",
    "/for-cooks/cook-dashboard/:path*",
    "/for-cooks/kitchen",
    "/for-cooks/kitchen/:path*",
    "/for-cooks/orders",
    "/for-cooks/orders/:path*",
    "/for-cooks/menu",
    "/for-cooks/menu/:path*",
    "/for-cooks/earnings",
    "/for-cooks/earnings/:path*",
    "/for-cooks/stripe-products",
    "/for-cooks/stripe-products/:path*",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/signup-cook",
    "/api/address/autocomplete",
    "/api/webhooks/stripe",
    "/api/webhooks/stripe-connect",
  ],
}
