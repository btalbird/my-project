import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CookMenuManager } from "@/components/cook-menu-manager"
import { getSessionUser } from "@/lib/auth-user"
import { cookSignInUrl, isCookRole } from "@/lib/cook-auth"

export const metadata: Metadata = {
  title: "Menu | Cook Portal | Munch",
}

export default async function CookMenuPage() {
  const user = await getSessionUser()
  if (!user) redirect(cookSignInUrl("/for-cooks/menu"))
  if (!isCookRole(user.role)) redirect("/for-cooks/cook-dashboard")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Menu</h1>
        <p className="mt-2 text-muted-foreground">Add dishes customers can order from your kitchen page.</p>
      </div>
      <CookMenuManager />
    </div>
  )
}
