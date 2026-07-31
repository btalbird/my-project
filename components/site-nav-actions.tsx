"use client"

import { useEffect, useState } from "react"
import { Menu, ShoppingCart, User, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useCartCount } from "@/hooks/use-cart-count"
import { SiteMobileMenu } from "@/components/site-mobile-menu"

type Props = {
  variant?: "default" | "hero"
  className?: string
}

export function SiteNavActions({ variant = "default", className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [userRole, setUserRole] = useState<string | null | undefined>(undefined)
  const cartItemCount = useCartCount(userId)

  const isHero = variant === "hero"

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me")
      .then(async (authRes) => {
        const d = (await authRes.json()) as { userId?: string | null; role?: string | null }
        if (!cancelled) {
          setUserId(d.userId ?? null)
          setUserRole(d.role ?? null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUserId(null)
          setUserRole(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUserId(null)
    setUserRole(null)
    setMobileMenuOpen(false)
    router.refresh()
    router.push("/")
  }

  const signedIn = Boolean(userId)
  const showAdminLink = userRole === "ADMIN"
  const showCookDashboardLink = userRole === "COOK" || userRole === "ADMIN"

  const iconButtonClass = cn(
    "rounded-full",
    isHero
      ? "text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
      : undefined,
  )

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <Button asChild variant="ghost" size="icon" className={cn("relative", iconButtonClass)}>
        <Link href="/cart">
          <ShoppingCart className="size-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {cartItemCount}
            </span>
          )}
          <span className="sr-only">Shopping cart</span>
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild className="hidden sm:flex">
          <Button variant="ghost" size="icon" className={iconButtonClass}>
            <User className="size-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {signedIn ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/member">Member portal</Link>
              </DropdownMenuItem>
              {showCookDashboardLink ? (
                <DropdownMenuItem asChild>
                  <Link href="/for-cooks/cook-dashboard">Cook Dashboard</Link>
                </DropdownMenuItem>
              ) : null}
              {showAdminLink ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin">Admin</Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild>
                <Link href="/orders">My Orders</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/nutrition-goals">Nutrition Goals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">Help</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void signOut()}>Sign out</DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/signin">Sign In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/signup">Create Account</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">Help</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {!signedIn && !isHero ? (
        <Button
          asChild
          className="hidden bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:flex rounded-full"
        >
          <Link href="/signin">Sign In</Link>
        </Button>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        className={cn("lg:hidden", iconButtonClass)}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-expanded={mobileMenuOpen}
        aria-controls="site-mobile-menu"
      >
        {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {mobileMenuOpen ? (
        <SiteMobileMenu
          signedIn={signedIn}
          showAdminLink={showAdminLink}
          showCookDashboardLink={showCookDashboardLink}
          onClose={() => setMobileMenuOpen(false)}
          onSignOut={() => void signOut()}
          className={isHero ? "sm:min-w-72" : undefined}
        />
      ) : null}
    </div>
  )
}
