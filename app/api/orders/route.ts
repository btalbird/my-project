import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

const LineSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.string().min(1),
})

const PostBodySchema = z.object({
  restaurant: z.string().min(1),
  lines: z.array(LineSchema).min(1),
  total: z.string().min(1),
  deliveryWindow: z.string().optional(),
  status: z.enum(["preparing", "in_transit", "delivered", "cancelled"]).optional(),
})

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const userId = await getSessionUserId()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = PostBodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { restaurant, lines, total, deliveryWindow, status } = parsed.data
  const items = {
    restaurant,
    lines,
    total,
    ...(deliveryWindow !== undefined ? { deliveryWindow } : {}),
  }

  const order = await prisma.order.create({
    data: {
      userId,
      status: status ?? "preparing",
      items,
    },
  })

  return NextResponse.json(order, { status: 201 })
}
