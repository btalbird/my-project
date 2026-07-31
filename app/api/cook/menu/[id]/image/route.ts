import { NextResponse } from "next/server"

import {
  getOwnedRestaurantIds,
  requireActiveCookSubscription,
  requireCookUser,
} from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { formatCents } from "@/lib/money"
import { isAllowedMenuImageType } from "@/lib/menu-item-image"
import { persistMenuItemImage } from "@/lib/menu-item-image-server"

const MAX_BYTES = 2 * 1024 * 1024

export async function POST(
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
    select: { id: true, restaurantId: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
  }

  const file = formData.get("photo")
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 })
  }
  if (!isAllowedMenuImageType(file.type)) {
    return NextResponse.json({ error: "Photo must be a JPEG, PNG, or WebP image." }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Photo must be 2 MB or smaller." }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const imageUrl = await persistMenuItemImage(existing.restaurantId, existing.id, bytes, file.type)

  const item = await prisma.menuItem.update({
    where: { id: existing.id },
    data: { imageUrl },
  })

  return NextResponse.json({
    item: { ...item, priceLabel: formatCents(item.priceCents) },
  })
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
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: "Menu item not found" }, { status: 404 })
  }

  const item = await prisma.menuItem.update({
    where: { id: existing.id },
    data: { imageUrl: null },
  })

  return NextResponse.json({
    item: { ...item, priceLabel: formatCents(item.priceCents) },
  })
}
