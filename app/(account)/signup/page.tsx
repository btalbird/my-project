import { Suspense } from "react"
import type { Metadata } from "next"

import { SignUpForm } from "@/components/sign-up-form"

export const metadata: Metadata = {
  title: "Sign up | In The Kitchen",
  description: "Create an In The Kitchen account to save favorites, track orders, and get local updates.",
}

export default function SignUpPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-background">
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground">Loading…</div>
        }
      >
        <SignUpForm />
      </Suspense>
    </main>
  )
}
