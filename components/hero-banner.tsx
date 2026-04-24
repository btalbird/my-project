"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import Link from "next/link"

export function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-r from-primary to-primary/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-primary-foreground space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-medium">Fees waived on your first order</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              Home-cooked meals, made by and for your community
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-md">
              Order from 1000+ MEHKO Certified Restaurants, and get your favorite comfort meal. Pick up, or select delivery where available
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-card text-foreground hover:bg-card/90 font-semibold">
                <Link href="/restaurants">Order Now</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 font-semibold"
              >
                <Link href="/restaurants">View Restaurants</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">30 min delivery where available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚗💨</span>
                <span className="text-sm">Track your order</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-9xl">🍔</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </section>
  )
}
