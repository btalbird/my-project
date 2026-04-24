import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

const BodySchema = z.object({
  restaurantId: z.number().int().positive(),
})

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { restaurantId } = parsed.data

  const existing = await prisma.favorite.findUnique({
    where: { userId_restaurantId: { userId, restaurantId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  }

  await prisma.favorite.create({
    data: { userId, restaurantId },
  })
  return NextResponse.json({ favorited: true })
}
