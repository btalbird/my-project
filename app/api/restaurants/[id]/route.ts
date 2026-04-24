import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const restaurantId = Number(id)
  if (!Number.isFinite(restaurantId)) {
    return NextResponse.json({ error: "Invalid restaurant id" }, { status: 400 })
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(restaurant)
}

