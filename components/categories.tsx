"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const categories = [
  { id: 1, name: "Korean", icon: "🍠", color: "bg-orange-50" },
  { id: 2, name: "Pizza", icon: "🍕", color: "bg-red-50" },
  { id: 4, name: "Mexican", icon: "🌮", color: "bg-green-50" },
  { id: 3, name: "Japanese", icon: "🍱", color: "bg-yellow-50" },
  { id: 5, name: "Sushi", icon: "🍣", color: "bg-pink-50" },
  { id: 6, name: "Indian", icon: "🍛", color: "bg-amber-50" },
  { id: 7, name: "Italian", icon: "🍝", color: "bg-rose-50" },
  { id: 8, name: "Desserts", icon: "🍰", color: "bg-purple-50" },
  { id: 9, name: "Healthy", icon: "🥗", color: "bg-emerald-50" },
  { id: 10, name: "Breakfast", icon: "🥞", color: "bg-blue-50" },
  { id: 11, name: "Coffee", icon: "☕", color: "bg-stone-50" },
  { id: 12, name: "Seafood", icon: "🦐", color: "bg-cyan-50" },
]

export function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="py-8 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Explore by Category</h2>
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Scroll left</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Scroll right</span>
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="flex flex-col items-center gap-2 p-4 min-w-[100px] rounded-2xl bg-secondary hover:bg-secondary/80 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center text-3xl`}>
                {category.icon}
              </div>
              <span className="text-sm font-medium text-foreground whitespace-nowrap">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
