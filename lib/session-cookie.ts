import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

import { SESSION_COOKIE } from "@/lib/session"
import { createSessionToken } from "@/lib/session-token"

export async function buildSessionCookie(userId: string, maxAge: number): Promise<ResponseCookie> {
  return {
    name: SESSION_COOKIE,
    value: await createSessionToken(userId),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge,
    secure: process.env.NODE_ENV === "production",
  }
}

export function clearSessionCookie(): ResponseCookie {
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  }
}
