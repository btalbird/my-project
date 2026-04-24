import { Suspense } from "react"

import { SignUpForm } from "@/components/sign-up-form"

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
