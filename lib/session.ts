import { cookies } from "next/headers"

/** HttpOnly cookie storing the signed-in user's `User.id` (Prisma cuid). */
export const SESSION_COOKIE = "itk_uid"

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies()
  const v = jar.get(SESSION_COOKIE)?.value
  return v && v.length > 0 ? v : null
}
