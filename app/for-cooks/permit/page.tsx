import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CookMehkoPermitForm } from "@/components/cook-mehko-permit-form"
import { getSessionUser } from "@/lib/auth-user"
import { cookSignInUrl, isCookRole } from "@/lib/cook-auth"

export const metadata: Metadata = {
  title: "MEHKO Permit | Cook Portal | Munch",
}

export default async function CookPermitPage() {
  const user = await getSessionUser()
  if (!user) redirect(cookSignInUrl("/for-cooks/permit"))
  if (!isCookRole(user.role)) redirect("/for-cooks/cook-dashboard")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">MEHKO permit</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Verify your home kitchen permit before your listing goes live. Beta verification is
          available for Long Beach kitchens.
        </p>
      </div>
      <CookMehkoPermitForm />
    </div>
  )
}
