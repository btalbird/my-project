import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import { SESSION_COOKIE } from "@/lib/session"

const MIN_PASSWORD = 8

export async function POST(req: Request) {
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

  let user
  try {
    user = await prisma.user.create({
      data: { email, passwordHash, name },
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }
    throw err
  }

  const res = NextResponse.json({ ok: true, userId: user.id })
  res.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  })
  return res
}
