import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Keep in sync with [lib/session.ts](lib/session.ts) — middleware cannot import server-only helpers. */
const SESSION_COOKIE = "itk_uid"

function needsAuth(pathname: string) {
  if (pathname === "/orders" || pathname.startsWith("/orders/")) return true
  if (pathname === "/member" || pathname.startsWith("/member/")) return true
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return true
  if (pathname.startsWith("/for-cooks/cook-dashboard")) return true
  return false
}

export function middleware(req: NextRequest) {
  if (!needsAuth(req.nextUrl.pathname)) return NextResponse.next()

  const uid = req.cookies.get(SESSION_COOKIE)?.value
  if (!uid) {
    const url = req.nextUrl.clone()
    url.pathname = "/signin"
    url.searchParams.set("next", `${req.nextUrl.pathname}${req.nextUrl.search}`)
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
  ],
}
