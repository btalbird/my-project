import { NextResponse } from "next/server"
import { z } from "zod"

import { canAccessStaffPortal, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    draftJson: z.unknown().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "No fields to update" })

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const design = await prisma.designDocument.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      status: true,
      draftJson: true,
      publishedAssetId: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  if (!design) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ design })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params

  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const existing = await prisma.designDocument.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.designDocument.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.draftJson !== undefined ? { draftJson: body.draftJson as any } : {}),
    },
    select: { id: true, name: true, status: true, updatedAt: true },
  })

  return NextResponse.json({ ok: true, design: updated })
}

