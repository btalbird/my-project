import { NextResponse } from "next/server"
import { z } from "zod"

import {
  getOwnedRestaurantIds,
  requireActiveCookSubscription,
  requireCookUser,
} from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { formatCents } from "@/lib/money"

const CreateMenuItemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  priceCents: z.number().int().min(50).max(500_00),
  image: z.string().trim().max(8).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
})

export async function GET() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  if (restaurantIds.length === 0) {
    return NextResponse.json({ items: [] })
  }

  const items = await prisma.menuItem.findMany({
    where: { restaurantId: { in: restaurantIds } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      priceLabel: formatCents(item.priceCents),
    })),
  })
}

export async function POST(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  const restaurantId = restaurantIds[0]
  if (!restaurantId) {
    return NextResponse.json({ error: "Create your kitchen before adding menu items." }, { status: 404 })
  }

  let body: z.infer<typeof CreateMenuItemSchema>
  try {
    body = CreateMenuItemSchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid menu item" }, { status: 400 })
  }

  const maxSort = await prisma.menuItem.aggregate({
    where: { restaurantId },
    _max: { sortOrder: true },
  })

  const item = await prisma.menuItem.create({
    data: {
      restaurantId,
      name: body.name,
      description: body.description || null,
      priceCents: body.priceCents,
      image: body.image || null,
      isAvailable: body.isAvailable ?? true,
      sortOrder: body.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  })

  return NextResponse.json({ item: { ...item, priceLabel: formatCents(item.priceCents) } }, { status: 201 })
}
