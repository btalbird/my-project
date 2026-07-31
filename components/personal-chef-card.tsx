import Image from "next/image"
import Link from "next/link"
import { ExternalLink, ShieldCheck } from "lucide-react"

import type { PersonalChef } from "@/lib/neighborhood-chefs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function PersonalChefCard({
  chef,
  monthlyListingFee,
}: {
  chef: PersonalChef
  monthlyListingFee?: string
}) {
  return (
    <Card className="h-full overflow-hidden border-2 border-border pt-0 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/5] w-full bg-muted">
        <Image
          src={chef.photoUrl}
          alt={chef.photoAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-16 pb-3 px-4">
          <p className="font-serif text-xl font-semibold text-white drop-shadow-sm">{chef.name}</p>
        </div>
      </div>
      <CardHeader className="space-y-2 pb-2 pt-5">
        <p className="text-sm leading-relaxed text-muted-foreground">{chef.quip}</p>
      </CardHeader>
      <CardContent className="space-y-3 pb-2 pt-0">
        {monthlyListingFee ? (
          <p className="text-xs font-medium text-foreground">
            Munch listing fee: <span className="tabular-nums">{monthlyListingFee}</span>
          </p>
        ) : null}
        <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-xs leading-snug text-muted-foreground">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-medium text-foreground">Retail food permit</p>
              <p className="mt-0.5 tabular-nums">{chef.healthPermitNumber}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Issued by {chef.issuingAgency}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border pt-5 pb-6">
        <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
          <Link href={chef.websiteUrl} target="_blank" rel="noopener noreferrer">
            Visit website
            <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
