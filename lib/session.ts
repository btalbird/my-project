import { cookies } from "next/headers"

import { parseSessionToken } from "@/lib/session-token"

/** HttpOnly cookie storing a signed session token for the user's `User.id`. */
export const SESSION_COOKIE = "itk_uid"

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies()
  const v = jar.get(SESSION_COOKIE)?.value
  if (!v) return null
  return await parseSessionToken(v)
}
