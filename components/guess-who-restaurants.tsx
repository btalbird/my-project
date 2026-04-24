"use client"

import type { CSSProperties } from "react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type Restaurant = {
  id: number
  name: string
  image: string
  cuisine: string
  rating: number
  deliveryTime: string
  deliveryFee: string
  promo?: string | null
}

type Tag = {
  id: number
  name: string
  slug: string
  type: "cuisine" | "trait"
}

type TagResponse = {
  cuisine: Tag[]
  trait: Tag[]
}

type Category = {
  id: number
  name: string
  slug: string
}

type CardState = "visible" | "enter" | "flipOut" | "folded"

// Slow “Guess Who” elimination: fold away slowly, a few at a time.
const FLIP_OUT_MS = 120000
const STAGGER_MS = 350

function buildRestaurantsQuery(tags: string[], categorySlug: string | null, q: string) {
  const query = q.trim()
  if (!tags.length && !categorySlug && !query) return ""
  const qs = new URLSearchParams()
  if (tags.length) qs.set("tags", tags.join(","))
  if (categorySlug) qs.set("category", categorySlug)
  if (query) qs.set("q", query)
  return `?${qs.toString()}`
}

export function GuessWhoRestaurants({ query }: { query: string }) {
  const [tags, setTags] = useState<TagResponse>({ cuisine: [], trait: [] })
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [cardStateById, setCardStateById] = useState<Record<number, CardState>>({})

  const pendingRemovalTimers = useRef<Map<number, { flip: number; folded: number; remove: number }>>(
    new Map(),
  )
  const pendingBatchRemoveTimer = useRef<number | null>(null)
  const cardEls = useRef<Map<number, HTMLAnchorElement>>(new Map())
  const prevRects = useRef<Map<number, DOMRect>>(new Map())

  useLayoutEffect(() => {
    // FLIP animation for reflowing grid items (remaining cards glide into place).
    // Skip when user prefers reduced motion.
    if (typeof window === "undefined") return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return

    const nextRects = new Map<number, DOMRect>()
    for (const r of restaurants) {
      const el = cardEls.current.get(r.id)
      if (!el) continue
      nextRects.set(r.id, el.getBoundingClientRect())
    }

    // Stagger glides so cards "flow" diagonally toward top-left.
    const moves: Array<{ id: number; dx: number; dy: number; score: number }> = []
    for (const [id, next] of nextRects) {
      const prev = prevRects.current.get(id)
      if (!prev) continue

      const dx = prev.left - next.left
      const dy = prev.top - next.top
      if (dx === 0 && dy === 0) continue

      // Lower score = closer to top-left in the *final* grid.
      const score = next.top * 10000 + next.left
      moves.push({ id, dx, dy, score })
    }

    moves.sort((a, b) => a.score - b.score)

    for (let i = 0; i < moves.length; i++) {
      const m = moves[i]
      const el = cardEls.current.get(m.id)
      if (!el) continue

      // Web Animations API keeps this smooth even during frequent reflows.
      // Delay creates the "flow" feeling as cards fill holes up-left first.
      const delay = i * 90
      el.animate(
        [{ transform: `translate(${m.dx}px, ${m.dy}px)` }, { transform: "translate(0px, 0px)" }],
        {
          duration: 3200,
          delay,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "both",
        },
      )
    }

    prevRects.current = nextRects
  }, [restaurants])

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data: TagResponse) => setTags(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const url = `/api/restaurants${buildRestaurantsQuery(selected, selectedCategory, query)}`

    fetch(url)
      .then((r) => r.json())
      .then((next: Restaurant[]) => {
        setRestaurants((prev) => {
          const nextIds = new Set(next.map((r) => r.id))
          const prevIds = new Set(prev.map((r) => r.id))

          // Flip out removed ones sporadically and keep "holes" until all flips finish.
          const removed = prev.filter((r) => !nextIds.has(r.id))
          const removedIds = new Set(removed.map((r) => r.id))

          // Clear any previous batch timer (new filter input supersedes).
          if (pendingBatchRemoveTimer.current) {
            window.clearTimeout(pendingBatchRemoveTimer.current)
            pendingBatchRemoveTimer.current = null
          }

          let maxDelay = 0
          removed.forEach((r) => {
            if (pendingRemovalTimers.current.has(r.id)) return

            // Random/sporadic start times, while still "a few at a time".
            const delay = Math.floor(Math.random() * 12000) + Math.floor(Math.random() * STAGGER_MS)
            maxDelay = Math.max(maxDelay, delay)

            const flipTimer = window.setTimeout(() => {
              setCardStateById((m) => ({ ...m, [r.id]: "flipOut" }))
            }, delay)

            // After fold finishes, keep an in-grid "down card" placeholder (still occupies slot).
            const foldedTimer = window.setTimeout(() => {
              setCardStateById((m) => ({ ...m, [r.id]: "folded" }))
            }, delay + FLIP_OUT_MS)

            // Individual remove timer is just tracked for cleanup; real removal happens in batch.
            const removeTimer = window.setTimeout(() => {}, delay + FLIP_OUT_MS + 50)
            pendingRemovalTimers.current.set(r.id, {
              flip: flipTimer,
              folded: foldedTimer,
              remove: removeTimer,
            })
          })

          if (removed.length) {
            // After the last flip completes, remove all flipped cards at once.
            pendingBatchRemoveTimer.current = window.setTimeout(() => {
              for (const id of removedIds) pendingRemovalTimers.current.delete(id)
              setRestaurants((cur) => cur.filter((x) => !removedIds.has(x.id)))
              setCardStateById((m) => {
                const nextMap = { ...m }
                for (const id of removedIds) delete nextMap[id]
                return nextMap
              })
            }, maxDelay + FLIP_OUT_MS + 80)
          }

          // Add any new ones and mark them as entering.
          const additions = next.filter((r) => !prevIds.has(r.id))
          if (additions.length) {
            for (const r of additions) {
              setCardStateById((m) => ({ ...m, [r.id]: "enter" }))
              window.setTimeout(() => {
                setCardStateById((m) => ({ ...m, [r.id]: "visible" }))
              }, 20)
            }
            // Keep existing order stable: next order + keep any flipOut still present (rare).
            return [...next]
          }

          // If only removals happened, keep prev and let timers remove; also update any that remain.
          if (next.length <= prev.length) {
            // Ensure remaining items still exist in list.
            const keep = prev.filter((r) => nextIds.has(r.id))
            return keep
          }

          return next
        })
      })
      .catch(() => {})
  }, [selected, selectedCategory, query])

  useEffect(() => {
    const timers = pendingRemovalTimers.current
    return () => {
      for (const t of timers.values()) {
        window.clearTimeout(t.flip)
        window.clearTimeout(t.folded)
        window.clearTimeout(t.remove)
      }
      timers.clear()
      if (pendingBatchRemoveTimer.current) window.clearTimeout(pendingBatchRemoveTimer.current)
    }
  }, [])

  const chipGroups = useMemo(() => {
    return [
      { title: "Cuisines", items: tags.cuisine },
    ] as const
  }, [tags])

  const anySelectedCount = selected.length + (selectedCategory ? 1 : 0)

  const count = restaurants.length
  const gridClass =
    count <= 10
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      : count <= 24
        ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7"
        : "grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 2xl:grid-cols-10"

  // Start ~2/3 size when many results, grow as results shrink.
  const cardScale = useMemo(() => {
    const hi = 100
    const lo = 12
    const t = Math.max(0, Math.min(1, (hi - count) / (hi - lo)))
    const start = 0.67
    const end = 1
    return start + (end - start) * t
  }, [count])

  return (
    <div className="mt-4">
      <div className="mt-3 space-y-3">
        {chipGroups.map((g) => (
          <div key={g.title} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{g.title}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((t) => {
                const isOn = selected.includes(t.slug)
                return (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => {
                      setSelected((cur) =>
                        cur.includes(t.slug) ? cur.filter((x) => x !== t.slug) : [...cur, t.slug],
                      )
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-full border text-[13px] transition-all",
                      "bg-card hover:bg-secondary",
                      isOn
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-foreground",
                    )}
                  >
                    {t.name}
                  </button>
                )
              })}

              {anySelectedCount ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelected([])
                    setSelectedCategory(null)
                  }}
                  className="px-2.5 py-1 rounded-full border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const isOn = selectedCategory === c.slug
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelectedCategory((cur) => (cur === c.slug ? null : c.slug))}
                  className={cn(
                    "px-2.5 py-1 rounded-full border text-[13px] transition-all",
                    "bg-card hover:bg-secondary",
                    isOn
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-foreground",
                  )}
                >
                  {c.name}
                </button>
              )
            })}

            {anySelectedCount ? (
              <button
                type="button"
                onClick={() => {
                  setSelected([])
                  setSelectedCategory(null)
                }}
                className="px-2.5 py-1 rounded-full border border-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Clear
              </button>
            ) : null}
          </div>

          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{restaurants.length}</span>{" "}
            results remaining
            {anySelectedCount ? (
              <span className="text-muted-foreground"> • {anySelectedCount} selected</span>
            ) : null}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 grid gap-3 transition-[grid-template-columns] duration-300",
          gridClass,
        )}
      >
        {restaurants.map((r) => {
          const st = cardStateById[r.id] ?? "visible"
          const isFolded = st === "folded"
          return (
            <a
              key={r.id}
              href={`/restaurants/${r.id}`}
              ref={(node) => {
                if (!node) {
                  cardEls.current.delete(r.id)
                  return
                }
                cardEls.current.set(r.id, node)
              }}
              className={cn(
                "relative rounded-2xl border-2 border-border bg-card p-2 transition-all",
                "hover:border-primary/40",
                st === "enter" && "scale-[0.98] opacity-0",
                st === "visible" && "scale-100 opacity-100",
                st === "flipOut" && "guesswho-flipout pointer-events-none",
                isFolded && "pointer-events-none bg-secondary/70 border-border",
              )}
              style={
                {
                  transformStyle: "preserve-3d",
                  "--guesswho-flip-ms": `${FLIP_OUT_MS}ms`,
                } as CSSProperties
              }
              aria-disabled={isFolded ? true : undefined}
              tabIndex={isFolded ? -1 : undefined}
            >
              {isFolded ? (
                <div
                  className="guesswho-folded h-full w-full rounded-xl border border-border/60 bg-muted/40"
                  aria-hidden="true"
                />
              ) : (
                <div
                  className="guesswho-card-inner origin-top-left transition-transform duration-[1800ms] ease-out"
                  style={{ transform: `scale(${cardScale})` }}
                >
                  <div className="text-3xl leading-none">{r.image}</div>
                  <div className="mt-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-foreground text-[13px] leading-snug">
                        {r.name}
                      </h2>
                      <span className="text-xs bg-secondary rounded-lg px-2 py-1">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.cuisine}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {r.deliveryTime} • {r.deliveryFee} delivery fee
                    </p>
                    {r.promo ? (
                      <p className="text-xs mt-2 inline-block bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        {r.promo}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </a>
          )
        })}
      </div>

    </div>
  )
}

