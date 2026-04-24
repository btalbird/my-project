"use client"

import { Search } from "lucide-react"

type SearchBarProps = {
  value?: string
  onChange?: (next: string) => void
  placeholder?: string
  /** Defaults to placeholder or a generic search label. */
  "aria-label"?: string
}

export function SearchBar({ value, onChange, placeholder, "aria-label": ariaLabel }: SearchBarProps) {
  const query = value ?? ""
  const ph = placeholder ?? "Home-cooked meals • Neighborhood chefs • Global flavors"

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden />
      <input
        type="search"
        placeholder={ph}
        value={query}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label={ariaLabel ?? ph}
        className="w-full pl-10 pr-4 py-2.5 bg-secondary border-2 border-border rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
      />
    </div>
  )
}
