import { NextResponse } from "next/server"

import {
  getOwnedRestaurantIds,
  requireActiveCookSubscription,
  requireCookUser,
} from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { parseItems } from "@/lib/order-format"

function parseMoneyTotal(total: string | undefined): number {
  if (!total) return 0
  const n = parseFloat(total.replace(/[^0-9.-]/g, ""))
  return Number.isFinite(n) ? n : 0
}

function mealCountFromItems(items: ReturnType<typeof parseItems>): number {
  return (items.lines ?? []).reduce((sum, line) => sum + line.qty, 0)
}

export async function GET(req: Request) {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const subCheck = await requireActiveCookSubscription(auth.user.id, auth.user.role)
  if ("response" in subCheck) return subCheck.response

  const restaurantIds = await getOwnedRestaurantIds(auth.user.id, auth.user.role)
  if (restaurantIds.length === 0) {
    return NextResponse.json({ days: [], summary: { orders: 0, meals: 0, gross: 0 } })
  }

  const url = new URL(req.url)
  const daysParam = url.searchParams.get("days")
  const days = Math.min(Math.max(parseInt(daysParam ?? "30", 10) || 30, 1), 90)

  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: { in: restaurantIds },
      paymentStatus: "paid",
      createdAt: { gte: since },
      status: { not: "cancelled" },
    },
    select: { createdAt: true, items: true },
    orderBy: { createdAt: "asc" },
  })

  const byDay = new Map<string, { date: string; orders: number; meals: number; gross: number }>()

  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(since.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, { date: key, orders: 0, meals: 0, gross: 0 })
  }

  let totalOrders = 0
  let totalMeals = 0
  let totalGross = 0

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10)
    const bucket = byDay.get(key)
    if (!bucket) continue

    const items = parseItems(order.items)
    const meals = mealCountFromItems(items)
    const gross = parseMoneyTotal(items.total)

    bucket.orders += 1
    bucket.meals += meals
    bucket.gross += gross

    totalOrders += 1
    totalMeals += meals
    totalGross += gross
  }

  const todayKey = new Date().toISOString().slice(0, 10)
  const today = byDay.get(todayKey) ?? { date: todayKey, orders: 0, meals: 0, gross: 0 }

  return NextResponse.json({
    days: Array.from(byDay.values()),
    summary: {
      orders: totalOrders,
      meals: totalMeals,
      gross: Math.round(totalGross * 100) / 100,
    },
    today: {
      orders: today.orders,
      meals: today.meals,
      gross: Math.round(today.gross * 100) / 100,
    },
  })
}
