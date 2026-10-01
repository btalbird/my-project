"use client"

import { FormEvent, useState } from "react"
import { Search } from "lucide-react"

type SearchBarProps = {
  value?: string
  onChange?: (next: string) => void
  /** Called with the trimmed query when the user submits the search. */
  onSubmit?: (query: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  /** Defaults to placeholder or a generic search label. */
  "aria-label"?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder,
  "aria-label": ariaLabel,
}: SearchBarProps) {
  const [internal, setInternal] = useState("")
  const controlled = value !== undefined && onChange !== undefined
  const query = controlled ? value : internal
  const ph = placeholder ?? "Home-cooked meals • Neighborhood chefs • Global flavors"

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit?.(query.trim())
  }

  return (
    <form role="search" className="relative w-full" onSubmit={handleSubmit}>
      <Search className="pointer-events-none absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        placeholder={ph}
        value={query}
        onChange={(e) => {
          const next = e.target.value
          if (controlled) onChange(next)
          else setInternal(next)
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? ph}
        className="w-full rounded-full border-2 border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </form>
  )
}
