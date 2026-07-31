"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { AddressAutocompleteInput } from "@/components/address-autocomplete-input"
import { SiteNavActions } from "@/components/site-nav-actions"
import { Button } from "@/components/ui/button"
import type { AddressSuggestion } from "@/lib/address-suggestion"

export function HeroBanner() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [selected, setSelected] = useState<AddressSuggestion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function goToRestaurants() {
    const trimmed = address.trim()
    setError(null)
    if (!trimmed) {
      router.push("/restaurants")
      return
    }
    setPending(true)
    try {
      const body =
        selected && selected.label === trimmed
          ? {
              line1: selected.line1,
              city: selected.city,
              state: selected.state,
              postalCode: selected.postalCode,
              lat: selected.lat,
              lng: selected.lng,
            }
          : { query: trimmed }

      const res = await fetch("/api/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not find that address")
        return
      }
      router.push("/restaurants")
      router.refresh()
    } finally {
      setPending(false)
    }
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
          className="h-9 w-auto max-w-[min(200px,55vw)] object-contain object-left sm:h-10 sm:max-w-[min(240px,55vw)]"
        />
      </Link>
      <SiteNavActions
        variant="hero"
        className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6 lg:right-8 lg:top-8"
      />
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
              <AddressAutocompleteInput
                id="hero-delivery-address"
                value={address}
                onValueChange={(next) => {
                  setAddress(next)
                  setSelected(null)
                }}
                onSelect={(suggestion) => {
                  setSelected(suggestion)
                  setAddress(suggestion.label)
                }}
                placeholder="Enter delivery address"
                inputClassName="min-w-0 w-full border-0 bg-transparent pr-8 text-left text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                listClassName="text-left"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    void goToRestaurants()
                  }
                }}
              />
            </div>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void goToRestaurants()}
              className="h-12 shrink-0 rounded-full bg-foreground px-6 font-semibold text-background hover:bg-foreground/90 sm:h-auto sm:self-stretch sm:px-8"
            >
              {pending ? "Finding kitchens…" : "View restaurants"}
            </Button>
          </div>
          {error ? <p className="text-sm text-primary-foreground/90">{error}</p> : null}

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
