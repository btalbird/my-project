import { NextResponse } from "next/server"

import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import type { Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const page = await prisma.page.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, draftSections: true, publishedVersionId: true },
  })
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const latest = await prisma.pageVersion.findFirst({
    where: { pageId: page.id },
    orderBy: { version: "desc" },
    select: { version: true },
  })
  const nextVersion = (latest?.version ?? 0) + 1

  const published = await prisma.$transaction(async (tx) => {
    const v = await tx.pageVersion.create({
      data: {
        pageId: page.id,
        version: nextVersion,
        sections: JSON.parse(JSON.stringify(page.draftSections)) as Prisma.InputJsonValue,
        createdById: user.id,
      },
      select: { id: true, version: true },
    })

    const updated = await tx.page.update({
      where: { id: page.id },
      data: {
        status: "PUBLISHED",
        publishedVersionId: v.id,
      },
      select: { id: true, publishedVersionId: true, status: true },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "page.publish",
        entityType: "Page",
        entityId: page.id,
        metadata: { version: v.version, slug: page.slug, title: page.title },
      },
    })

    return { version: v, page: updated }
  })

  return NextResponse.json({ ok: true, ...published })
}

