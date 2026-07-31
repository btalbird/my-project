"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  signedIn: boolean
  showAdminLink: boolean
  showCookDashboardLink: boolean
  onClose: () => void
  onSignOut: () => void
  id?: string
  className?: string
}

export function SiteMobileMenu({
  signedIn,
  showAdminLink,
  showCookDashboardLink,
  onClose,
  onSignOut,
  id = "site-mobile-menu",
  className,
}: Props) {
  return (
    <div
      id={id}
      className={cn(
        "absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[min(18rem,calc(100vw-2rem))] space-y-3 rounded-xl border-2 border-border bg-card p-4 text-foreground shadow-lg backdrop-blur-sm lg:hidden",
        className,
      )}
    >
      {signedIn ? (
        <>
          <Link
            href="/member"
            className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            onClick={onClose}
          >
            Member portal
          </Link>
          {showCookDashboardLink ? (
            <Link
              href="/for-cooks/cook-dashboard"
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              onClick={onClose}
            >
              Cook Portal
            </Link>
          ) : (
            <Link
              href="/for-cooks/signin"
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              onClick={onClose}
            >
              Cook Portal
            </Link>
          )}
          {showAdminLink ? (
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
              onClick={onClose}
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/orders"
            className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            onClick={onClose}
          >
            My orders
          </Link>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            onClick={() => {
              onClose()
              onSignOut()
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <>
          <Button asChild className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/signin" onClick={onClose}>
              Sign In
            </Link>
          </Button>
          <Link
            href="/signup"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
            onClick={onClose}
          >
            Create Account
          </Link>
          <Link
            href="/for-cooks/signin"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
            onClick={onClose}
          >
            Cook Portal
          </Link>
          <Link
            href="/help"
            className="block rounded-lg px-3 py-2 text-center text-sm font-medium hover:bg-secondary"
            onClick={onClose}
          >
            Help
          </Link>
        </>
      )}
    </div>
  )
}
