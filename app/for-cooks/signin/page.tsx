import type { Metadata } from "next"
import { Suspense } from "react"

import { CookSignInForm } from "@/components/cook-sign-in-form"

export const metadata: Metadata = {
  title: "Cook Sign In | Munch",
  description: "Sign in to manage your home kitchen, Stripe payouts, menu, and orders on Munch.",
}

export default function CookSignInPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        }
      >
        <CookSignInForm />
      </Suspense>
    </div>
  )
}
