"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

const DELIVERY_ADDRESS_KEY = "munch_delivery_address"

export function HeroBanner() {
  const router = useRouter()
  const [address, setAddress] = useState("")

  function goToRestaurants() {
    const trimmed = address.trim()
    if (trimmed) {
      try {
        sessionStorage.setItem(DELIVERY_ADDRESS_KEY, trimmed)
      } catch {
        /* ignore quota / private mode */
      }
    }
    router.push("/restaurants")
  }

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-primary px-4 py-16 text-center text-primary-foreground sm:px-6"
    >
      <Link
        href="/"
        className="absolute left-4 top-4 z-10 rounded-xl bg-primary-foreground/95 px-2 py-1.5 shadow-sm ring-1 ring-white/40 sm:left-6 sm:top-6 lg:left-8 lg:top-8"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static PNG from /public */}
        <img
          src="/brand/munch-logo.png"
          alt="Munch"
          width={904}
          height={389}
          className="h-9 w-auto max-w-[min(200px,55vw)] object-contain object-left sm:h-10 sm:max-w-[240px]"
        />
      </Link>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8">
        <div className="space-y-3">
          <h1
            id="home-hero-heading"
            className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
          >
            Discover home-cooked meals
          </h1>
          <p className="text-pretty text-lg font-medium leading-snug text-primary-foreground/90 sm:text-xl md:text-2xl">
            Made by neighbors, for neighbors.
          </p>
        </div>

        <div className="w-full space-y-4">
          <label htmlFor="hero-delivery-address" className="sr-only">
            Delivery address
          </label>
          <div className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:max-w-2xl sm:flex-row sm:items-stretch sm:rounded-full sm:bg-primary-foreground sm:p-1.5 sm:shadow-md">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-primary-foreground px-4 py-3 shadow-sm ring-offset-2 ring-offset-primary focus-within:ring-2 focus-within:ring-primary/40 sm:shadow-none sm:ring-offset-0 sm:focus-within:ring-0">
              <MapPin className="size-5 shrink-0 text-foreground" aria-hidden />
              <input
                id="hero-delivery-address"
                type="text"
                autoComplete="street-address"
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    goToRestaurants()
                  }
                }}
                className="min-w-0 flex-1 border-0 bg-transparent text-left text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <Button
              type="button"
              onClick={() => goToRestaurants()}
              className="h-12 shrink-0 rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/90 sm:h-auto sm:self-stretch sm:px-8"
            >
              View restaurants
            </Button>
          </div>

          <p>
            <Link
              href="/signin"
              className="text-sm text-primary-foreground/90 underline underline-offset-4 hover:text-primary-foreground focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
