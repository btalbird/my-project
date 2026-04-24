"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function ReturnToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 10)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Return to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={[
        "fixed right-4 bottom-6 z-40",
        "rounded-full border-2 border-border bg-card/95 backdrop-blur px-3 py-3 shadow-sm",
        "transition-all duration-200",
        "hover:border-primary/40 hover:bg-secondary",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
        show ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-2 opacity-0 pointer-events-none",
      ].join(" ")}
    >
      <ArrowUp className="h-5 w-5 text-foreground" />
    </button>
  )
}

