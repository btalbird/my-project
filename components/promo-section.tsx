"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Users, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Promo = {
  id: number
  title: string
  subtitle: string
  /** Optional second line; omitted when not needed. */
  description?: string
  bgColor: string
  textColor?: string
  subTextColor?: string
  descriptionColor?: string
  icon?: LucideIcon
  imageSrc?: string
  imageAlt?: string
  /** If set, "Learn More" goes here instead of `/promos/[id]`. */
  learnMoreHref?: string
  buttonClassName?: string
}

const promos: Promo[] = [
  {
    id: 1,
    title: "Meet Your Neighbors",
    subtitle: "Connect with local cooks",
    description: "Become part of a caring food community",
    bgColor: "bg-gradient-to-br from-primary/90 to-primary",
    textColor: "text-[#f4e9c6]",
    subTextColor: "text-[#f4e9c6]/90",
    descriptionColor: "text-[#f4e9c6]/75",
    buttonClassName:
      "border-2 border-[#f4e9c6] bg-transparent text-[#f4e9c6] hover:bg-[#f4e9c6] hover:text-primary",
    icon: Users,
    learnMoreHref: "/community/local-cooks",
  },
  {
    id: 2,
    title: "MEHKO Certified",
    subtitle: "What is MEHKO certification?",
    description: "Permitted kitchens serving restaurant-quality food right in your neighborhood.",
    bgColor: "bg-gradient-to-br from-accent to-accent/80",
    textColor: "text-accent-foreground",
    subTextColor: "text-accent-foreground/90",
    descriptionColor: "text-accent-foreground/75",
    imageSrc: "/mehko-certified.svg",
    imageAlt: "MEHKO certification",
    buttonClassName:
      "border-2 border-[#566129] bg-[#e8eefc] text-[#566129] hover:bg-[#566129] hover:text-[#becef8] hover:border-[#566129]",
  },
  {
    id: 3,
    title: "Cook with Love",
    subtitle: "Community exchange",
    description: "Explore new recipes and share your own",
    bgColor: "bg-gradient-to-br from-background to-card",
    textColor: "text-[#566129]",
    subTextColor: "text-[#566129]/85",
    descriptionColor: "text-[#566129]/75",
    icon: Heart,
    buttonClassName: "bg-[#566129] text-[#f4e9c6] hover:bg-[#566129]/90",
  },
]

export function PromoSection() {
  return (
    <section className="py-10 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-foreground">Why Our Community Loves Us</h2>
          <p className="text-muted-foreground mt-2">
            More than just food - we&apos;re building connections! Get to know your neighbors, and support a local business.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`${promo.bgColor} rounded-2xl p-8 relative overflow-hidden border-2 border-white/10`}
            >
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5">
                  {promo.imageSrc ? (
                    <Image
                      src={promo.imageSrc}
                      alt={promo.imageAlt ?? ""}
                      className="w-7 h-7 object-contain"
                      width={28}
                      height={28}
                    />
                  ) : promo.icon ? (
                    <promo.icon className="w-7 h-7" />
                  ) : null}
                </div>
                <h3 className={`text-xl font-serif font-bold mb-2 ${promo.textColor ?? "text-white"}`}>
                  {promo.title}
                </h3>
                <p
                  className={
                    promo.description
                      ? `${promo.subTextColor ?? "text-white/90"} font-medium mb-1`
                      : `${promo.subTextColor ?? "text-white/90"} font-medium mb-5 text-balance`
                  }
                >
                  {promo.subtitle}
                </p>
                {promo.description ? (
                  <p className={`text-sm mb-5 ${promo.descriptionColor ?? "text-white/70"}`}>{promo.description}</p>
                ) : null}
                <Button
                  asChild
                  size="sm"
                  className={`font-semibold rounded-full px-6 ${promo.buttonClassName ?? "bg-white text-foreground hover:bg-white/90"}`}
                >
                  <Link href={promo.learnMoreHref ?? `/promos/${promo.id}`}>Learn More</Link>
                </Button>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute right-10 bottom-10 w-16 h-16 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
