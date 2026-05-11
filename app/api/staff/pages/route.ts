import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { canAccessStaffPortal, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const createSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "Slug must be kebab-case (letters, numbers, dashes)")
    .optional(),
})

function defaultSections() {
  return []
}

function randomSlug() {
  return `page-${Math.random().toString(16).slice(2, 8)}`
}

export async function GET() {
  const user = await getSessionUser()
  if (!user || !canAccessStaffPortal(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, updatedAt: true },
  })

  return NextResponse.json({ pages })
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

  // Ensure slug uniqueness with a simple retry loop.
  for (let i = 0; i < 5; i++) {
    const slug = body.slug ?? randomSlug()
    try {
      const page = await prisma.page.create({
        data: {
          title: body.title ?? "Untitled page",
          slug,
          draftSections: defaultSections(),
          createdById: user.id,
        },
        select: { id: true },
      })
      return NextResponse.json({ ok: true, id: page.id }, { status: 201 })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue
      throw err
    }
  }

  return NextResponse.json({ error: "Could not generate a unique slug" }, { status: 500 })
}

