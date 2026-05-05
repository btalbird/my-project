import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

import { isEmailInAdminAllowlist } from "@/lib/admin-allowlist"
import { prisma } from "@/lib/db"
import { SESSION_COOKIE } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  let body: { email?: string; password?: string; remember?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = String(body.email ?? "").trim().toLowerCase()
  const password = String(body.password ?? "")
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false
  if (!user || !ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  let sessionUser = user
  if (isEmailInAdminAllowlist(email) && user.role !== "ADMIN") {
    sessionUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    })
  }

  const maxAge = body.remember === false ? 60 * 60 * 24 : 60 * 60 * 24 * 30

  const res = NextResponse.json({
    ok: true,
    userId: sessionUser.id,
    role: sessionUser.role,
  })
  res.cookies.set(SESSION_COOKIE, sessionUser.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  })
  return res
}
