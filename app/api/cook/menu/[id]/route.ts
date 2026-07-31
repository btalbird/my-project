import { NextResponse } from "next/server"
import { z } from "zod"

import {
  getOwnedRestaurantIds,
  requireActiveCookSubscription,
  requireCookUser,
} from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { formatCents } from "@/lib/money"

const UpdateMenuItemSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  priceCents: z.number().int().min(50).max(500_00).optional(),
  image: z.string().trim().max(8).nullable().optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const { id } = await params
  const itemId = Number.parseInt(id, 10)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
  }

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  const existing = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId: { in: restaurantIds } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
  }

  let body: z.infer<typeof UpdateMenuItemSchema>
  try {
    body = UpdateMenuItemSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid menu item" }, { status: 400 })
  }

  const item = await prisma.menuItem.update({
    where: { id: itemId },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.priceCents !== undefined ? { priceCents: body.priceCents } : {}),
      ...(body.image !== undefined ? { image: body.image } : {}),
      ...(body.isAvailable !== undefined ? { isAvailable: body.isAvailable } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
  })

  return NextResponse.json({ item: { ...item, priceLabel: formatCents(item.priceCents) } })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const { id } = await params
  const itemId = Number.parseInt(id, 10)
  if (!Number.isFinite(itemId)) {
    return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
  }

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  const existing = await prisma.menuItem.findFirst({
    where: { id: itemId, restaurantId: { in: restaurantIds } },
  })
  if (!existing) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
  }

  await prisma.menuItem.delete({ where: { id: itemId } })
  return NextResponse.json({ ok: true })
}
