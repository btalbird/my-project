"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { AddressSuggestion } from "@/lib/address-suggestion"

type Props = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  onSelect: (suggestion: AddressSuggestion) => void
  placeholder?: string
  autoComplete?: string
  disabled?: boolean
  inputClassName?: string
  listClassName?: string
  wrapperClassName?: string
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export function AddressAutocompleteInput({
  id,
  value,
  onValueChange,
  onSelect,
  placeholder = "Enter delivery address",
  autoComplete = "street-address",
  disabled = false,
  inputClassName,
  listClassName,
  wrapperClassName,
  onKeyDown,
}: Props) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  useEffect(() => {
    const trimmed = value.trim()
    if (trimmed.length < 3) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)

      void fetch(`/api/address/autocomplete?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: { suggestions?: AddressSuggestion[] }) => {
          const next = Array.isArray(data.suggestions) ? data.suggestions : []
          setSuggestions(next)
          setOpen(next.length > 0)
          setActiveIndex(-1)
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([])
            setOpen(false)
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, 280)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  function choose(suggestion: AddressSuggestion) {
    onSelect(suggestion)
    onValueChange(suggestion.label)
    setOpen(false)
    setActiveIndex(-1)
    setSuggestions([])
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (open && suggestions.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % suggestions.length)
        return
      }
      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
        return
      }
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        return
      }
      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault()
        const picked = suggestions[activeIndex]
        if (picked) choose(picked)
        return
      }
    }
    onKeyDown?.(event)
  }

  const showList = open && suggestions.length > 0

  return (
    <div ref={rootRef} className={cn("relative min-w-0 flex-1", wrapperClassName)}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        className={cn(loading && "pr-9", inputClassName)}
      />
      {loading ? (
        <Loader2
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : null}
      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-64 overflow-auto rounded-xl border border-border bg-popover p-1 text-left shadow-lg",
            listClassName,
          )}
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.id} role="presentation">
              <button
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent",
                  index === activeIndex && "bg-accent",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(suggestion)}
              >
                <span className="block font-medium leading-snug">{suggestion.line1}</span>
                <span className="block text-xs text-muted-foreground">
                  {[suggestion.city, suggestion.state, suggestion.postalCode].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
