import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { canAccessStaffPortal, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const patchSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "Slug must be kebab-case (letters, numbers, dashes)")
      .optional(),
    draftSections: z.unknown().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: "No fields to update" })

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const page = await prisma.page.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, status: true, draftSections: true, publishedVersionId: true },
  })
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ page })
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

  const existing = await prisma.page.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  try {
    const updated = await prisma.page.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.draftSections !== undefined ? { draftSections: body.draftSections as any } : {}),
      },
      select: { id: true, title: true, slug: true, status: true, updatedAt: true },
    })
    return NextResponse.json({ ok: true, page: updated })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 })
    }
    throw err
  }
}

