"use client"

import { ChefHat } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/password-input"

/** Same-origin paths only; rejects protocol-relative URLs like `//evil.com`. */
function safePostLoginPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/for-cooks/cook-dashboard"
  return next
}

export function CookSignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            <ChefHat className="h-3.5 w-3.5" />
            Cook portal
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold text-foreground">Kitchen Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your home kitchen, connect Stripe payouts, build your menu, and fulfill orders from your neighbors.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              const form = e.currentTarget
              const fd = new FormData(form)
              const email = String(fd.get("email") ?? "")
              const password = String(fd.get("password") ?? "")
              setPending(true)
              try {
                const res = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, remember }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                  setError(typeof data.error === "string" ? data.error : "Sign in failed")
                  return
                }
                const next = searchParams.get("next")
                router.push(safePostLoginPath(next))
                router.refresh()
              } finally {
                setPending(false)
              }
            }}
          >
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-normal text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="chef@mail.com"
                autoComplete="email"
                className="rounded-none border-0 border-b px-0 shadow-none focus-visible:border-b-ring focus-visible:ring-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-normal text-muted-foreground">
                Password
              </Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                className="rounded-none border-0 border-b pl-0 pr-10 shadow-none focus-visible:border-b-ring focus-visible:ring-0"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground">
                Remember for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              disabled={pending}
              className="w-44 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {pending ? "Signing in…" : "Sign in to kitchen"}
            </Button>

            <p className="text-sm text-muted-foreground">
              New to Munch kitchens?{" "}
              <Link href="/for-cooks/signup" className="text-primary hover:underline">
                Create a cook account
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Ordering meals instead?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Member sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:items-center">
        <div className="relative w-full overflow-hidden rounded-3xl border-2 border-border bg-card p-8">
          <h2 className="font-serif text-2xl font-bold">Your kitchen dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            After sign-in you can complete onboarding and run a fully functional beta kitchen:
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>Connect Stripe Express for payouts.</li>
            <li>Subscribe to your kitchen listing.</li>
            <li>Add your permitted kitchen address and profile.</li>
            <li>Publish menu items and sync your Stripe product catalog.</li>
            <li>Accept and fulfill test orders from neighbors.</li>
          </ol>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href="/for-cooks/become-a-cook">MEHKO permit guide</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
