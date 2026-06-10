import { NextResponse } from "next/server"

import { getOwnedRestaurantIds, requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const auth = await requireCookUser()
  if ("response" in auth) return auth.response

  const { user } = auth

  const [restaurants, subscription, connect] = await Promise.all([
    prisma.restaurant.findMany({
      where: user.role === "ADMIN" ? {} : { ownerId: user.id },
      select: { id: true, name: true, cuisine: true, image: true },
      orderBy: { name: "asc" },
    }),
    prisma.cookSubscription.findUnique({
      where: { userId: user.id },
      select: {
        status: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
      },
    }),
    prisma.cookConnect.findUnique({
      where: { userId: user.id },
      select: {
        stripeAccountId: true,
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      },
    }),
  ])

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    restaurants,
    subscription: subscription
      ? {
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
          hasBillingAccount: Boolean(subscription.stripeCustomerId),
        }
      : null,
    hasActiveSubscription: user.role === "ADMIN" || subscription?.status === "active",
    restaurantIds: await getOwnedRestaurantIds(user.id, user.role),
    connect: connect
      ? {
          hasAccount: true,
          chargesEnabled: connect.chargesEnabled,
          payoutsEnabled: connect.payoutsEnabled,
          detailsSubmitted: connect.detailsSubmitted,
          readyForPayments: connect.chargesEnabled && connect.detailsSubmitted,
        }
      : {
          hasAccount: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          readyForPayments: false,
        },
  })
}
