import type { UserRole } from "@prisma/client"

import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/session"

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: UserRole
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const id = await getSessionUserId()
  if (!id) return null

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  })
  return user
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN"
}

export function canAccessStaffPortal(role: UserRole): boolean {
  return role === "ADMIN" || role === "STAFF"
}
