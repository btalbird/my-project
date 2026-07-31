import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CookKitchenPageClient } from "@/components/cook-kitchen-page-client"
import { getSessionUser } from "@/lib/auth-user"
import { cookSignInUrl, isCookRole } from "@/lib/cook-auth"

export const metadata: Metadata = {
  title: "Kitchen | Cook Portal | Munch",
}

export default async function CookKitchenPage() {
  const user = await getSessionUser()
  if (!user) redirect(cookSignInUrl("/for-cooks/kitchen"))
  if (!isCookRole(user.role)) redirect("/for-cooks/cook-dashboard")

  return <CookKitchenPageClient />
}
