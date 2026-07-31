import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CookOrdersClient } from "@/components/cook-orders-client"
import { getSessionUser } from "@/lib/auth-user"
import { cookSignInUrl, isCookRole } from "@/lib/cook-auth"

export const metadata: Metadata = {
  title: "Orders | Cook Portal | Munch",
}

export default async function CookOrdersPage() {
  const user = await getSessionUser()
  if (!user) redirect(cookSignInUrl("/for-cooks/orders"))
  if (!isCookRole(user.role)) redirect("/for-cooks/cook-dashboard")

  return <CookOrdersClient />
}
