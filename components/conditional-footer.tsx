"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/footer"

/** Focused flows where site-wide footer links distract from the primary action. */
const FOOTER_HIDDEN_PATHS = new Set(["/signin", "/signup", "/for-cooks/signin", "/for-cooks/signup", "/cart"])

export function ConditionalFooter() {
  const pathname = usePathname()
  if (FOOTER_HIDDEN_PATHS.has(pathname)) return null
  return <Footer />
}
