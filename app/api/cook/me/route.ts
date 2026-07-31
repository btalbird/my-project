import { NextResponse } from "next/server"

import { getOwnedRestaurantIds, requireCookUser } from "@/lib/cook-auth"
import { prisma } from "@/lib/db"
import { refreshMehkoPermitForRestaurant } from "@/lib/mehko-permit-maintenance"
import { isPermitLive, isPermitRenewalDue } from "@/lib/mehko-permit-verify"

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

  const restaurantIds = await getOwnedRestaurantIds(user.id, user.role)

  const primaryRestaurantId = restaurants[0]?.id
  let mehkoPermitSummary: {
    status: string
    expiresAt: string | null
    isLive: boolean
    renewalDue: boolean
    rejectionReason: string | null
  } | null = null

  if (primaryRestaurantId) {
    await refreshMehkoPermitForRestaurant(primaryRestaurantId)
    const permit = await prisma.kitchenMehkoPermit.findUnique({
      where: { restaurantId: primaryRestaurantId },
      select: { status: true, expiresAt: true, rejectionReason: true, jurisdictionId: true },
    })
    if (permit) {
      mehkoPermitSummary = {
        status: permit.status,
        expiresAt: permit.expiresAt?.toISOString() ?? null,
        isLive: isPermitLive(permit),
        renewalDue: isPermitRenewalDue(permit),
        rejectionReason: permit.rejectionReason,
      }
    }
  }

  const [menuItemCount, paidOrderCount] = await Promise.all([
    restaurantIds.length > 0
      ? prisma.menuItem.count({ where: { restaurantId: { in: restaurantIds } } })
      : Promise.resolve(0),
    restaurantIds.length > 0
      ? prisma.order.count({
          where: { restaurantId: { in: restaurantIds }, paymentStatus: "paid" },
        })
      : Promise.resolve(0),
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
          hasBillingAccount: Boolean(
            subscription.stripeCustomerId || connect?.stripeAccountId,
          ),
        }
      : connect?.stripeAccountId
        ? {
            status: "none",
            currentPeriodEnd: null,
            hasBillingAccount: true,
          }
        : null,
    hasActiveSubscription: user.role === "ADMIN" || subscription?.status === "active",
    restaurantIds,
    menuItemCount,
    paidOrderCount,
    mehkoPermit: mehkoPermitSummary,
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
