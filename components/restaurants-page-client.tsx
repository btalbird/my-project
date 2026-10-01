"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchBar } from "@/components/search-bar"
import { GuessWhoRestaurants } from "@/components/guess-who-restaurants"
import { ReturnToTop } from "@/components/return-to-top"

export function RestaurantsPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get("q") ?? ""
  const [query, setQuery] = useState(urlQuery)

  useEffect(() => {
    setQuery(urlQuery)
  }, [urlQuery])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const current = (searchParams.get("q") ?? "").trim()
      const next = query.trim()
      if (current === next) return
      const params = new URLSearchParams(searchParams.toString())
      if (next) params.set("q", next)
      else params.delete("q")
      const qs = params.toString()
      router.replace(qs ? `/restaurants?${qs}` : "/restaurants", { scroll: false })
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query, router, searchParams])

  const trimmed = query.trim()

  return (
    <main className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {trimmed
              ? `Kitchens near you matching “${trimmed}”.`
              : "Browse community kitchens near you."}
          </p>
        </div>

        <div
          className="w-full sm:w-[360px] sm:max-w-[45vw] sm:shrink-0 sm:self-start sm:sticky sm:top-4 sm:z-30"
        >
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </div>

      <GuessWhoRestaurants query={query} />
      <ReturnToTop />
    </main>
  )
}

