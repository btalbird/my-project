"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CookSignUpForm() {
  const router = useRouter()
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl font-bold text-foreground">Start your home kitchen on Munch</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a cook account, set up your kitchen listing, and appear to neighbors searching for homemade meals
            near their address.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              if (!agree) return
              const form = e.currentTarget
              const fd = new FormData(form)
              const email = String(fd.get("email") ?? "")
              const password = String(fd.get("password") ?? "")
              const name = String(fd.get("fullName") ?? "").trim()
              setPending(true)
              try {
                const res = await fetch("/api/auth/signup-cook", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, name }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                  setError(typeof data.error === "string" ? data.error : "Sign up failed")
                  return
                }
                router.push("/for-cooks/cook-dashboard")
                router.refresh()
              } finally {
                setPending(false)
              }
            }}
          >
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-normal text-muted-foreground">
                Full name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Jane Doe"
                autoComplete="name"
                className="rounded-none border-0 border-b px-0 shadow-none focus-visible:border-b-ring focus-visible:ring-0"
                required
              />
            </div>

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
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                className="rounded-none border-0 border-b px-0 shadow-none focus-visible:border-b-ring focus-visible:ring-0"
                required
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox id="terms" checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
              <Label htmlFor="terms" className="text-xs font-normal leading-relaxed text-muted-foreground">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-primary hover:underline">
                  Terms &amp; Conditions
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!agree || pending}
              className="w-44 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create cook account"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Already have a cook account?{" "}
              <Link href="/signin?next=/for-cooks/cook-dashboard" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Ordering meals instead?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Member sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:items-center">
        <div className="relative w-full overflow-hidden rounded-3xl border-2 border-border bg-card p-8">
          <h2 className="font-serif text-2xl font-bold">What happens next</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-muted-foreground">
            <li>Add your kitchen name, cuisine, and permitted home address.</li>
            <li>Neighbors who enter their delivery address will see you sorted by distance.</li>
            <li>Connect Stripe and subscribe when you are ready to accept paid orders.</li>
          </ol>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href="/for-cooks/become-a-cook">MEHKO permit guide</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
