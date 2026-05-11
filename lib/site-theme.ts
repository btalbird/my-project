import { prisma } from "@/lib/db"
import {
  SITE_THEME_ID,
  brandThemeToCss,
  parseBrandThemeV1,
  themeHeaderPublic,
  type BrandThemeV1,
  type PublicBrandHeader,
} from "@/lib/brand-theme"

export type PublishedSiteBranding = {
  theme: BrandThemeV1
  css: string
  header: PublicBrandHeader
}

export async function getPublishedSiteBranding(): Promise<PublishedSiteBranding | null> {
  const row = await prisma.siteTheme.findUnique({
    where: { id: SITE_THEME_ID },
    select: { publishedJson: true },
  })
  if (!row?.publishedJson) return null
  const theme = parseBrandThemeV1(row.publishedJson)
  return {
    theme,
    css: brandThemeToCss(theme),
    header: themeHeaderPublic(theme),
  }
}
