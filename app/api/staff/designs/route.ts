import { NextResponse } from "next/server"
import { z } from "zod"

import { canAccessStaffPortal, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const createSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
})

function defaultDraftJson() {
  return {
    version: 1,
    canvas: { width: 1200, height: 628, background: "#ffffff" },
    layers: [],
  }
}

export async function GET() {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const designs = await prisma.designDocument.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, status: true, updatedAt: true, createdAt: true },
  })

  return NextResponse.json({ designs })
}

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const design = await prisma.designDocument.create({
    data: {
      name: body.name ?? "Untitled design",
      draftJson: defaultDraftJson(),
      createdById: user.id,
    },
    select: { id: true },
  })

  return NextResponse.json({ ok: true, id: design.id }, { status: 201 })
}

