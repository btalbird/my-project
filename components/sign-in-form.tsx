"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-3xl">Welcome back</CardTitle>
            <CardDescription>Please enter your details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
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
                  router.push(next && next.startsWith("/") ? next : "/")
                  router.refresh()
                } finally {
                  setPending(false)
                }
              }}
            >
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                    Remember for 30 days
                  </Label>
                </div>
                <Link href="/help" className="text-sm text-primary hover:underline">
                  Forgot password
                </Link>
              </div>

              <Button type="submit" className="w-full rounded-full" disabled={pending}>
                {pending ? "Signing in…" : "Sign in"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo account: <span className="font-medium text-foreground">demo@inthekitchen.com</span> /{" "}
                <span className="font-medium text-foreground">demo1234</span> (seeded orders after{" "}
                <code className="rounded bg-muted px-1">node ./scripts/seed.mjs</code>).
              </p>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full rounded-full">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  G
                </span>
                Sign in with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="block">
        <div className="relative h-full overflow-hidden rounded-3xl border-2 border-border bg-gradient-to-br from-primary/15 via-accent/10 to-secondary">
          <div className="absolute inset-0">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-4 py-2 text-sm text-foreground backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary" />
                In The Kitchen
              </div>
              <h2 className="text-balance font-serif text-3xl font-bold text-foreground">
                Nourishing community, one meal at a time
              </h2>
              <p className="max-w-md text-muted-foreground">
                Sign in to track orders, save favorites, and personalize your nutrition goals.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-xl rounded-3xl border bg-card/50 p-6 backdrop-blur">
                <div
                  className="flex w-full items-center justify-center rounded-2xl bg-white p-6 text-center text-sm font-medium text-black"
                  style={{ aspectRatio: "900 / 700" }}
                >
                  Graphic placeholder - one neighbor/chef passing food off to neighbor/family. Should have good
                  representation of regular people - different races, hair textures, body types, etc.
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-2xl border bg-card/60 p-4 backdrop-blur">
                Fast checkout • Order tracking • Community kitchens
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
