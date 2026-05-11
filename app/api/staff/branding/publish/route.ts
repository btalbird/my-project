import { NextResponse } from "next/server"

import { parseBrandThemeV1, SITE_THEME_ID, brandThemeToCss } from "@/lib/brand-theme"
import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

export async function POST() {
  const user = await getSessionUser()
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const row = await prisma.siteTheme.findUnique({ where: { id: SITE_THEME_ID } })
  if (!row) {
    return NextResponse.json({ error: "Save draft first" }, { status: 400 })
  }
  const draft = parseBrandThemeV1(row.draftJson)

  const updated = await prisma.siteTheme.update({
    where: { id: SITE_THEME_ID },
    data: {
      publishedJson: draft,
      status: "PUBLISHED",
    },
    select: { updatedAt: true },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "siteTheme.publish",
      entityType: "SiteTheme",
      entityId: SITE_THEME_ID,
      metadata: { previewCssLen: brandThemeToCss(draft).length },
    },
  })

  return NextResponse.json({ ok: true, updatedAt: updated.updatedAt })
}
