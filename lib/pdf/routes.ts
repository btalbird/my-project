import { prisma } from "@/lib/db"

/** Public static routes included in site-wide PDF export. */
export const STATIC_EXPORT_PATHS = [
  "/",
  "/restaurants",
  "/cart",
  "/delivery",
  "/download",
  "/help",
  "/signin",
  "/signup",
  "/for-cooks/become-a-cook",
  "/for-cooks/bring-itk-to-your-neighborhood",
  "/for-cooks/cook-dashboard",
  "/for-cooks/earnings",
  "/for-cooks/mehko-counties",
  "/for-cooks/recipe-guidelines",
  "/community/blog",
  "/community/community-events",
  "/community/food-donation",
  "/community/local-cooks",
  "/community/our-story",
  "/community/partners",
  "/support/accessibility",
  "/support/contact-us",
  "/support/food-safety",
  "/support/help-center",
  "/support/social",
  "/legal/cookies",
  "/legal/privacy",
  "/legal/terms",
  "/nutrition/allergen-info",
  "/nutrition/dietary-preferences",
  "/nutrition/guide",
  "/nutrition/meal-planning",
  "/promos/2",
  "/promos/3",
  "/promos/3/add-recipe",
] as const

export async function getDynamicExportPaths(): Promise<string[]> {
  const [restaurants, categories] = await Promise.all([
    prisma.restaurant.findMany({ select: { id: true }, orderBy: { id: "asc" } }),
    prisma.category.findMany({ select: { slug: true }, orderBy: { slug: "asc" } }),
  ])

  return [
    ...restaurants.map((r) => `/restaurants/${r.id}`),
    ...categories.map((c) => `/categories/${c.slug}`),
  ]
}

export async function getAllExportPaths(): Promise<string[]> {
  const dynamic = await getDynamicExportPaths()
  return [...STATIC_EXPORT_PATHS, ...dynamic]
}

export function isExportablePath(path: string): boolean {
  const normalized = normalizeExportPath(path)
  if ((STATIC_EXPORT_PATHS as readonly string[]).includes(normalized)) return true
  if (/^\/restaurants\/\d+$/.test(normalized)) return true
  if (/^\/categories\/[a-z0-9-]+$/.test(normalized)) return true
  return false
}

export function normalizeExportPath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed || trimmed.includes("://")) {
    throw new Error("Invalid path")
  }

  const withoutQuery = trimmed.split("?")[0]?.split("#")[0] ?? ""
  const normalized = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`
  if (normalized.includes("..")) {
    throw new Error("Invalid path")
  }
  return normalized.replace(/\/+$/, "") || "/"
}

export function pathToFilename(path: string): string {
  if (path === "/") return "home.pdf"
  return `${path.slice(1).replace(/\//g, "-")}.pdf`
}
