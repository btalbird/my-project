"use client"

import { useEffect, useState } from "react"
import { MapPin, ShoppingCart, User, Menu, X, Leaf } from "lucide-react"
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
import { SearchBar } from "./search-bar"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userId, setUserId] = useState<string | null | undefined>(undefined)
  const [userRole, setUserRole] = useState<string | null | undefined>(undefined)
  const cartItemCount = 3

  useEffect(() => {
    let cancelled = false
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { userId?: string | null; role?: string | null }) => {
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

  const wordmark = "Munch"
  const tagline = "Nourishing Community"
  const logoUrl: string | null = null

  return (
    <header className="relative bg-card/95 backdrop-blur-sm border-b-2 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-10 w-auto max-w-[160px] object-contain" />
            ) : (
              <div className="w-10 h-10 bg-primary/10 border-2 border-primary/30 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="hidden sm:block">
              <span className="text-lg font-serif font-bold text-foreground">{wordmark}</span>
              <p className="text-xs text-muted-foreground -mt-0.5">{tagline}</p>
            </div>
            <span className="sr-only">Go to home page</span>
          </Link>

          {/* Delivery Address - Desktop */}
          <Link
            href="/delivery"
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Delivering to</p>
              <p className="text-sm font-medium text-foreground">Your Neighborhood</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button asChild variant="ghost" size="icon" className="relative rounded-full">
              <Link href="/cart">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
              </Link>
            </Button>

            {/* User Menu - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden sm:flex">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {signedIn ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/member">Member portal</Link>
                    </DropdownMenuItem>
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

            {/* Sign In Button - Desktop */}
            {!signedIn ? (
              <Button
                asChild
                className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
            ) : null}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-3">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-border py-4 space-y-3">
            <Link
              href="/delivery"
              className="flex items-center gap-2 px-3 py-2 w-full rounded-lg hover:bg-secondary transition-colors"
            >
              <MapPin className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Delivering to</p>
                <p className="text-sm font-medium text-foreground">Your Neighborhood</p>
              </div>
            </Link>
            {signedIn ? (
              <>
                <Link
                  href="/member"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  Member portal
                </Link>
                {showAdminLink ? (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    Admin
                  </Link>
                ) : null}
                <Link
                  href="/orders"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  My orders
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => void signOut()}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                <Link href="/signin">Sign In</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
