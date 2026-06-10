import { NextResponse } from "next/server"

import { getSessionUser, isAdminRole } from "@/lib/auth-user"

export async function authorizePdfExport(req: Request): Promise<NextResponse | null> {
  const secret = process.env.PDF_EXPORT_SECRET?.trim()
  if (secret) {
    const auth = req.headers.get("authorization")
    if (auth === `Bearer ${secret}`) return null
  }

  const user = await getSessionUser()
  if (user && isAdminRole(user.role)) return null

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
