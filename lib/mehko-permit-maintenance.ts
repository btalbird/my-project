import type { MehkoPermitStatus } from "@prisma/client"

import { prisma } from "@/lib/db"
import { isPermitRenewalDue } from "@/lib/mehko-permit-verify"

export async function refreshExpiredMehkoPermits(now = new Date()): Promise<number> {
  const expired = await prisma.kitchenMehkoPermit.findMany({
    where: {
      status: "approved",
      expiresAt: { lte: now },
    },
    select: { id: true, restaurantId: true },
  })

  if (expired.length === 0) return 0

  await prisma.$transaction([
    prisma.kitchenMehkoPermit.updateMany({
      where: { id: { in: expired.map((p) => p.id) } },
      data: {
        status: "expired",
        lastCheckedAt: now,
      },
    }),
    prisma.restaurant.updateMany({
      where: { id: { in: expired.map((p) => p.restaurantId) } },
      data: { isPublished: false },
    }),
  ])

  return expired.length
}

export async function refreshMehkoPermitForRestaurant(restaurantId: number, now = new Date()) {
  const permit = await prisma.kitchenMehkoPermit.findUnique({
    where: { restaurantId },
  })
  if (!permit) return null

  if (permit.status === "approved" && permit.expiresAt && permit.expiresAt <= now) {
    return prisma.kitchenMehkoPermit.update({
      where: { id: permit.id },
      data: { status: "expired", lastCheckedAt: now },
    })
  }

  if (
    permit.status === "approved" &&
    isPermitRenewalDue(permit, now) &&
    permit.expiresAt &&
    permit.expiresAt > now
  ) {
    return prisma.kitchenMehkoPermit.update({
      where: { id: permit.id },
      data: { status: "renewal_required", lastCheckedAt: now },
    })
  }

  return permit
}

export async function approveMehkoPermit(
  restaurantId: number,
  reviewerId: string,
  now = new Date(),
) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.kitchenMehkoPermit.update({
      where: { restaurantId },
      data: {
        status: "approved" satisfies MehkoPermitStatus,
        reviewedAt: now,
        reviewedById: reviewerId,
        rejectionReason: null,
        lastCheckedAt: now,
      },
    })
    await tx.restaurant.update({
      where: { id: restaurantId },
      data: { isPublished: true },
    })
    return permit
  })
}

export async function rejectMehkoPermit(
  restaurantId: number,
  reviewerId: string,
  rejectionReason: string,
  now = new Date(),
) {
  return prisma.$transaction(async (tx) => {
    const permit = await tx.kitchenMehkoPermit.update({
      where: { restaurantId },
      data: {
        status: "rejected",
        reviewedAt: now,
        reviewedById: reviewerId,
        rejectionReason,
        lastCheckedAt: now,
      },
    })
    await tx.restaurant.update({
      where: { id: restaurantId },
      data: { isPublished: false },
    })
    return permit
  })
}
