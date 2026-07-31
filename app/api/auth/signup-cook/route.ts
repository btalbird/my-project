import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { isEmailInAdminAllowlist } from "@/lib/admin-allowlist"
import { prisma } from "@/lib/db"
import { checkRateLimit, clientIp } from "@/lib/rate-limit"
import { buildSessionCookie } from "@/lib/session-cookie"

export const dynamic = "force-dynamic"

const MIN_PASSWORD = 8

export async function POST(req: Request) {
  const rate = checkRateLimit(`signup:${clientIp(req)}`, 5, 60_000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } },
    )
  }

  let body: { email?: string; password?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")
  const nameRaw = body.name !== undefined ? String(body.name).trim() : ""
  const name = nameRaw.length > 0 ? nameRaw : null

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD} characters` }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const role = isEmailInAdminAllowlist(email) ? "ADMIN" : "COOK"

  let user
  try {
    user = await prisma.user.create({
      data: { email, passwordHash, name, role },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    throw err
  }

  const res = NextResponse.json({ ok: true, userId: user.id, role: user.role })
  res.cookies.set(await buildSessionCookie(user.id, 60 * 60 * 24 * 30))
  return res
}
