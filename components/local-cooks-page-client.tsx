"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { useMemo, useState } from "react"

import { PersonalChefCard } from "@/components/personal-chef-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import type { PersonalChef } from "@/lib/neighborhood-chefs"
import { DEFAULT_NEIGHBORHOOD_LABEL, filterChefsByQuery } from "@/lib/neighborhood-chefs"

type Props = {
  chefs: PersonalChef[]
}

export function LocalCooksPageClient({ chefs }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => filterChefsByQuery(chefs, query), [chefs, query])
  const total = chefs.length

  return (
    <main className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/community/our-story" className="hover:text-foreground transition-colors">
            Community
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-foreground">Local cooks</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              MEHKO Certified Chefs in your neighborhood
            </h1>
            <p className="text-muted-foreground">
              Meet MEHKO Certified Chefs serving your block. Each profile lists their retail food permit and the county
              environmental health agency that issued it, so you know who you are inviting to your table.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border-2 border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Serving near</p>
                <p className="text-sm font-semibold text-foreground">{DEFAULT_NEIGHBORHOOD_LABEL}</p>
                <Button variant="link" className="h-auto p-0 text-sm" asChild>
                  <Link href="/delivery">Update delivery address</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-sm text-muted-foreground">
            {query.trim() ? (
              <>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {filtered.length} of {total}
                </span>{" "}
                MEHKO Certified Chefs
                {filtered.length === 0 ? " — try a different search." : " matching your search."}
              </>
            ) : (
              <>
                Showing <span className="font-medium text-foreground">{total}</span> MEHKO Certified Chefs permitted to
                operate near this address.
              </>
            )}
          </p>
          <div className="w-full sm:max-w-md sm:shrink-0">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search chefs, cuisine, permit #, or agency…"
              aria-label="Search chefs"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Sample permit numbers and agencies are illustrative; replace with live data from your compliance feed when
          ready.
        </p>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-border bg-card/50 px-6 py-14 text-center">
            <p className="font-medium text-foreground">No MEHKO Certified Chefs match that search</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a name (e.g. Marisol), a style of food (e.g. Korean), a county, or part of a permit number.
            </p>
            <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((chef) => (
              <li key={chef.id}>
                <PersonalChefCard chef={chef} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
