import { NextResponse } from "next/server"

import { clearSessionCookie } from "@/lib/session-cookie"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(clearSessionCookie())
  return res
}
