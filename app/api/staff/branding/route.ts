import { NextResponse } from "next/server"

import { brandThemeV1Schema, defaultBrandThemeV1, parseBrandThemeV1, SITE_THEME_ID } from "@/lib/brand-theme"
import { canAccessStaffPortal, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

async function ensureRow() {
  const existing = await prisma.siteTheme.findUnique({ where: { id: SITE_THEME_ID } })
  if (existing) return existing
  const draft = defaultBrandThemeV1()
  return prisma.siteTheme.create({
    data: {
      id: SITE_THEME_ID,
      draftJson: draft,
      status: "DRAFT",
    },
  })
}

export async function GET() {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const row = await ensureRow()
  const draft = parseBrandThemeV1(row.draftJson)
  const published = row.publishedJson ? parseBrandThemeV1(row.publishedJson) : null
  return NextResponse.json({
    draft,
    published,
    status: row.status,
  })
}

export async function PATCH(req: Request) {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const parsed = brandThemeV1Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
  }
  await ensureRow()
  const updated = await prisma.siteTheme.update({
    where: { id: SITE_THEME_ID },
    data: { draftJson: parsed.data, status: "DRAFT" },
    select: { updatedAt: true },
  })
  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt })
}
