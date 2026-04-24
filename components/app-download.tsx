"use client"

import { Leaf, Users, Heart, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AppDownload() {
  return (
    <section className="py-16 bg-primary/5 border-y-2 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Join 1000+ home cooks</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-balance">
              Bringing communities together, one meal at a time
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Download our app to discover unique homemade meals from your neighbors and become part of a caring food community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-full px-6">
                <Link href="/download">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-full px-6">
                <Link href="/download">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                Google Play
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              {/* Rustic illustration */}
              <div className="w-72 h-72 rounded-full bg-card border-4 border-dashed border-primary/30 flex items-center justify-center shadow-xl">
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4 text-5xl">
                    <span>🥗</span>
                    <span>🍲</span>
                    <span>🥘</span>
                  </div>
                  <p className="text-muted-foreground font-serif italic text-sm px-8">Homemade goodness delivered with care</p>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center border-2 border-accent/30">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center border-2 border-rose-200">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
