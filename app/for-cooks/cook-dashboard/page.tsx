import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { CookDashboardClient } from "@/components/cook-dashboard-client"
import { getSessionUser } from "@/lib/auth-user"
import { cookSignInUrl, isCookRole } from "@/lib/cook-auth"

export const metadata: Metadata = {
  title: "Cook Dashboard | Munch",
  description: "Manage your kitchen listing, subscription, and orders on Munch.",
}

export default async function CookDashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect(cookSignInUrl("/for-cooks/cook-dashboard"))

  if (!isCookRole(user.role)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-serif text-3xl font-bold tracking-tight">Cook Dashboard</h1>
          <p className="mt-4 text-muted-foreground">
            This portal is for registered Munch cooks. Your account ({user.email}) does not have
            cook access yet. Contact an admin to be promoted to cook and assigned a kitchen.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Interested in cooking? Start with our{" "}
            <a href="/for-cooks/become-a-cook" className="text-primary underline-offset-4 hover:underline">
              MEHKO permit guide
            </a>
            .
          </p>
        </main>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted-foreground">Loading cook dashboard…</div>
      }
    >
      <CookDashboardClient />
    </Suspense>
  )
}
