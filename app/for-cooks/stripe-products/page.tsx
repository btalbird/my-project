import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { CookStripeProductsManager } from "@/components/cook-stripe-products-manager"
import { getSessionUser } from "@/lib/auth-user"
import { cookSignInUrl, isCookRole } from "@/lib/cook-auth"

export const metadata: Metadata = {
  title: "Stripe Products | Cook Portal | Munch",
}

export default async function CookStripeProductsPage() {
  const user = await getSessionUser()
  if (!user) redirect(cookSignInUrl("/for-cooks/stripe-products"))
  if (!isCookRole(user.role)) redirect("/for-cooks/cook-dashboard")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Stripe products</h1>
        <p className="mt-2 text-muted-foreground">
          Create catalog items on your connected Stripe account for the sample storefront.
        </p>
      </div>
      <CookStripeProductsManager />
    </div>
  )
}
