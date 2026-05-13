"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignUpForm() {
  const router = useRouter()
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl font-bold text-foreground">Welcome to your neighborhood kitchen</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to discover home chefs near you, order homemade meals, and support your community—one
            dish at a time.
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
                const res = await fetch("/api/auth/signup", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, name }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                  setError(typeof data.error === "string" ? data.error : "Sign up failed")
                  return
                }
                router.push("/member")
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
                placeholder="janedoe@mail.com"
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
              {pending ? "Creating…" : "Sign up"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:items-center">
        <div className="relative w-full overflow-hidden rounded-3xl border-2 border-border bg-card">
          <div
            className="flex w-full items-center justify-center p-6 text-center text-sm font-medium text-foreground"
            style={{ aspectRatio: "900 / 700" }}
          >
            Graphic placeholder
          </div>
        </div>
      </div>
    </div>
  )
}
