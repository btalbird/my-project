import type { Metadata } from "next"
import Link from "next/link"

import { CommunityPartnersBrowser } from "@/components/community-partners-browser"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { COMMUNITY_PARTNERS } from "@/lib/community-partners"

export const metadata: Metadata = {
  title: "Our community partners | In The Kitchen",
  description:
    "Browse local organizations and projects In The Kitchen supports through neighborhood profit sharing—third spaces, childcare, mutual aid, and more.",
}

export default function CommunityPartnersPage() {
  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/community/community-events" className="hover:text-foreground transition-colors">
              Community-led spaces
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground">Our partners</span>
          </nav>

          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Meet our partners
              </h1>
              <Badge variant="secondary" className="rounded-full">
                Community-led projects
              </Badge>
            </div>
            <p className="max-w-3xl text-muted-foreground">
              These are the kinds of neighborhood-led groups your orders help fund through our local profit-sharing
              program. Search by name, city, or a word in their story. (Demo listings—swap in live partners anytime.)
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/community/community-events">Back to community-led spaces</Link>
            </Button>
          </div>

          <div className="mt-10">
            <CommunityPartnersBrowser partners={COMMUNITY_PARTNERS} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
