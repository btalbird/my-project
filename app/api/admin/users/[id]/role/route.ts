import { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"
import { z } from "zod"

import { isAdminRole, getSessionUser } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const bodySchema = z.object({
  role: z.nativeEnum(UserRole),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSessionUser()
  if (!admin || !isAdminRole(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: targetId } = await params
  if (!targetId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    const json = await req.json()
    body = bodySchema.parse(json)
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  })
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (target.role === "ADMIN" && body.role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot remove the last admin" }, { status: 400 })
    }
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: body.role },
    select: { id: true, email: true, name: true, role: true },
  })

  return NextResponse.json(updated)
}
