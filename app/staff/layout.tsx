import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { canAccessStaffPortal, getSessionUser, isAdminRole } from "@/lib/auth-user"

export const metadata: Metadata = {
  title: "Staff | Munch",
  description: "Edit site content and visuals.",
}

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect("/signin?next=/staff")
  if (!canAccessStaffPortal(user.role)) redirect("/member")

  return (
    <div className="min-h-[calc(100vh-4rem)] border-t border-border bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link href="/staff" className="font-medium text-foreground hover:underline">
            Staff
          </Link>
          {isAdminRole(user.role) ? (
            <>
              <span aria-hidden>·</span>
              <Link href="/admin" className="hover:text-foreground hover:underline">
                Admin
              </Link>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <Link href="/member" className="hover:text-foreground hover:underline">
            Member portal
          </Link>
        </nav>
        {children}
      </div>
    </div>
  )
}
