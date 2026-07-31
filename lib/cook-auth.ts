import type { UserRole } from "@prisma/client"
import { NextResponse } from "next/server"

import { getSessionUser, type SessionUser } from "@/lib/auth-user"
import { COOK_SIGNIN_PATH, cookSignInUrl, isCookPortalPath } from "@/lib/cook-portal-paths"
import { prisma } from "@/lib/db"

export { COOK_SIGNIN_PATH, cookSignInUrl, isCookPortalPath }

export function isCookRole(role: UserRole): boolean {
  return role === "COOK" || role === "ADMIN"
}

export async function requireCookUser(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getSessionUser()
  if (!user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (!isCookRole(user.role)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { user }
}

export async function requireActiveCookSubscription(
  userId: string,
  role: UserRole,
): Promise<
  | { subscription: { status: string; stripeCustomerId: string } }
  | { response: NextResponse }
> {
  if (role === "ADMIN") {
    return { subscription: { status: "active", stripeCustomerId: "" } }
  }

  const subscription = await prisma.cookSubscription.findUnique({
    where: { userId },
    select: { status: true, stripeCustomerId: true },
  })
  if (!subscription || subscription.status !== "active") {
    return {
      response: NextResponse.json(
        { error: "Active listing subscription required" },
        { status: 402 },
      ),
    }
  }
  return { subscription }
}

export async function getOwnedRestaurantIds(userId: string, role: UserRole): Promise<number[]> {
  if (role === "ADMIN") {
    const all = await prisma.restaurant.findMany({ select: { id: true } })
    return all.map((r) => r.id)
  }
  const owned = await prisma.restaurant.findMany({
    where: { ownerId: userId },
    select: { id: true },
  })
  return owned.map((r) => r.id)
}
