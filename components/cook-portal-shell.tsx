"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChefHat, ClipboardList, FileCheck, Home, MenuSquare, Store, UtensilsCrossed, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"

const PORTAL_PREFIXES = [
  "/for-cooks/cook-dashboard",
  "/for-cooks/kitchen",
  "/for-cooks/permit",
  "/for-cooks/menu",
  "/for-cooks/orders",
  "/for-cooks/earnings",
  "/for-cooks/recipe-guidelines",
  "/for-cooks/stripe-products",
]

const navItems = [
  { href: "/for-cooks/cook-dashboard", label: "Home", icon: Home },
  { href: "/for-cooks/orders", label: "Orders", icon: ClipboardList },
  { href: "/for-cooks/menu", label: "Menu", icon: MenuSquare },
  { href: "/for-cooks/stripe-products", label: "Stripe catalog", icon: Store },
  { href: "/for-cooks/kitchen", label: "Kitchen", icon: UtensilsCrossed },
  { href: "/for-cooks/permit", label: "Permit", icon: FileCheck },
  { href: "/for-cooks/earnings", label: "Earnings", icon: Wallet },
  { href: "/for-cooks/recipe-guidelines", label: "Guidelines", icon: ChefHat },
]

export function CookPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showShell = PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!showShell) return <>{children}</>

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
        <aside className="shrink-0 lg:w-56">
          <div className="flex items-center gap-2 text-primary lg:px-2">
            <ChefHat className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Cook portal</span>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition-colors lg:rounded-lg",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
