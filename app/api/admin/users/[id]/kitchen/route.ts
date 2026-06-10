import { NextResponse } from "next/server"
import { z } from "zod"

import { getSessionUser, isAdminRole } from "@/lib/auth-user"
import { prisma } from "@/lib/db"

const bodySchema = z.object({
  restaurantId: z.number().int().positive().nullable(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSessionUser()
  if (!admin || !isAdminRole(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: userId } = await params
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (body.restaurantId === null) {
    await prisma.restaurant.updateMany({
      where: { ownerId: userId },
      data: { ownerId: null },
    })
    return NextResponse.json({ ok: true, restaurantId: null })
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: body.restaurantId },
    select: { id: true, name: true },
  })
  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
  }

  await prisma.$transaction([
    prisma.restaurant.updateMany({
      where: { ownerId: userId },
      data: { ownerId: null },
    }),
    prisma.restaurant.update({
      where: { id: body.restaurantId },
      data: { ownerId: userId },
    }),
  ])

  return NextResponse.json({ ok: true, restaurantId: restaurant.id, restaurantName: restaurant.name })
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getSessionUser()
  if (!admin || !isAdminRole(admin.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id: userId } = await params
  const owned = await prisma.restaurant.findFirst({
    where: { ownerId: userId },
    select: { id: true, name: true },
  })

  return NextResponse.json({ restaurant: owned })
}
