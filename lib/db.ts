import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

/** Old dev singletons can survive HMR without delegates for newer models (e.g. after `prisma generate`). */
function hasSiteThemeDelegate(client: PrismaClient): boolean {
  const d = (client as unknown as { siteTheme?: { findUnique?: unknown } }).siteTheme
  return typeof d?.findUnique === "function"
}

let prisma: PrismaClient = globalThis.prisma ?? createPrismaClient()

if (
  process.env.NODE_ENV !== "production" &&
  globalThis.prisma != null &&
  !hasSiteThemeDelegate(globalThis.prisma)
) {
  void globalThis.prisma.$disconnect().catch(() => {})
  prisma = createPrismaClient()
}

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

export { prisma }

