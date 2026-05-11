import { z } from "zod"

export const SITE_THEME_ID = "site" as const

export const brandThemeV1Schema = z.object({
  version: z.literal(1),
  primary: z.string().min(1).max(64),
  primaryForeground: z.string().min(1).max(64),
  accent: z.string().min(1).max(64),
  accentForeground: z.string().min(1).max(64),
  background: z.string().min(1).max(64),
  foreground: z.string().min(1).max(64),
  secondary: z.string().min(1).max(64),
  secondaryForeground: z.string().min(1).max(64),
  muted: z.string().min(1).max(64),
  mutedForeground: z.string().min(1).max(64),
  border: z.string().min(1).max(64),
  card: z.string().min(1).max(64),
  cardForeground: z.string().min(1).max(64),
  radiusRem: z.number().min(0).max(3),
  fontPreset: z.enum(["geist", "system", "serif"]),
  logoUrl: z
    .preprocess((v) => {
      if (v === null || v === undefined) return null
      if (typeof v !== "string") return null
      const s = v.trim()
      return s.length === 0 ? null : s
    }, z.union([z.string().max(2000), z.null()])),
  wordmark: z.string().min(1).max(80),
  tagline: z.string().min(1).max(120),
})

export type BrandThemeV1 = z.infer<typeof brandThemeV1Schema>

export function defaultBrandThemeV1(): BrandThemeV1 {
  return {
    version: 1,
    primary: "oklch(0.50 0.14 245)",
    primaryForeground: "oklch(0.98 0.01 230)",
    accent: "oklch(0.55 0.12 235)",
    accentForeground: "oklch(0.98 0.01 230)",
    background: "oklch(0.98 0.01 230)",
    foreground: "oklch(0.20 0.04 240)",
    secondary: "oklch(0.94 0.03 230)",
    secondaryForeground: "oklch(0.25 0.05 240)",
    muted: "oklch(0.92 0.03 230)",
    mutedForeground: "oklch(0.45 0.05 240)",
    border: "oklch(0.88 0.04 230)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.20 0.04 240)",
    radiusRem: 0.625,
    fontPreset: "geist",
    logoUrl: null,
    wordmark: "Munch",
    tagline: "Nourishing Community",
  }
}

export function parseBrandThemeV1(raw: unknown): BrandThemeV1 {
  const parsed = brandThemeV1Schema.safeParse(raw)
  if (parsed.success) return parsed.data
  return defaultBrandThemeV1()
}

/** CSS snippet for :root (light). Dark class unchanged — MVP is light-first. */
export function brandThemeToCss(theme: BrandThemeV1): string {
  const logoUrl = theme.logoUrl?.trim() || null
  const fontSans =
    theme.fontPreset === "system"
      ? "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
      : theme.fontPreset === "serif"
        ? "ui-serif, Georgia, Cambria, Times New Roman, Times, serif"
        : "var(--font-sans-fallback, 'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif)"

  const lines = [
    ":root {",
    `  --background: ${theme.background};`,
    `  --foreground: ${theme.foreground};`,
    `  --card: ${theme.card};`,
    `  --card-foreground: ${theme.cardForeground};`,
    `  --popover: ${theme.card};`,
    `  --popover-foreground: ${theme.cardForeground};`,
    `  --primary: ${theme.primary};`,
    `  --primary-foreground: ${theme.primaryForeground};`,
    `  --secondary: ${theme.secondary};`,
    `  --secondary-foreground: ${theme.secondaryForeground};`,
    `  --muted: ${theme.muted};`,
    `  --muted-foreground: ${theme.mutedForeground};`,
    `  --accent: ${theme.accent};`,
    `  --accent-foreground: ${theme.accentForeground};`,
    `  --border: ${theme.border};`,
    `  --input: ${theme.border};`,
    `  --ring: ${theme.primary};`,
    `  --radius: ${theme.radiusRem}rem;`,
  ]
  if (theme.fontPreset !== "geist") {
    lines.push(`  --font-sans: ${fontSans};`)
  }
  lines.push("}")
  if (logoUrl) {
    lines.push(`/* brand-logo ${logoUrl} */`)
  }
  return lines.join("\n")
}

export type PublicBrandHeader = {
  logoUrl: string | null
  wordmark: string
  tagline: string
}

export function themeHeaderPublic(theme: BrandThemeV1): PublicBrandHeader {
  const logoUrl = theme.logoUrl?.trim() || null
  return {
    logoUrl: logoUrl && logoUrl.length > 0 ? logoUrl : null,
    wordmark: theme.wordmark,
    tagline: theme.tagline,
  }
}
