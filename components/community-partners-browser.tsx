"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ExternalLink, Search } from "lucide-react"

import type { CommunityPartner } from "@/lib/community-partners"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

function normalize(s: string) {
  return s.toLowerCase().trim()
}

export function CommunityPartnersBrowser({ partners }: { partners: CommunityPartner[] }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return partners
    return partners.filter((p) => {
      const hay = `${p.name} ${p.neighborhood} ${p.description}`
      return normalize(hay).includes(q)
    })
  }, [partners, query])

  return (
    <div className="space-y-8">
      <div className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, neighborhood, or topic…"
          className="border-2 pl-9"
          aria-label="Search community partners"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No partners match that search. Try another word or clear the box.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <Card className="h-full overflow-hidden border-2 border-border">
                <div className="relative aspect-[4/3] w-full bg-muted">
                  <Image
                    src={p.imageSrc}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <CardHeader className="space-y-1">
                  <CardTitle className="font-serif text-xl leading-tight">{p.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">{p.neighborhood}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.websiteUrl ? (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={p.websiteUrl} target="_blank" rel="noopener noreferrer">
                          Website
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </Button>
                    ) : null}
                    {p.socialUrl ? (
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={p.socialUrl} target="_blank" rel="noopener noreferrer">
                          {p.socialLabel}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </Button>
                    ) : null}
                    {!p.websiteUrl && !p.socialUrl ? (
                      <p className="text-xs text-muted-foreground">Links coming soon for this partner.</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
