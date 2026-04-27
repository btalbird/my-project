import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Deployment / parity check: open `/api/health` on Vercel vs localhost.
 * Does not expose secrets — only whether DATABASE_URL exists and DB answers.
 */
export async function GET() {
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL?.trim())

  if (!databaseUrlConfigured) {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlConfigured: false,
        dbReachable: false,
        hint: "Set DATABASE_URL in Vercel Project → Settings → Environment Variables, then redeploy.",
      },
      { status: 503 },
    )
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      ok: true,
      databaseUrlConfigured: true,
      dbReachable: true,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlConfigured: true,
        dbReachable: false,
        hint: "DATABASE_URL is set but the database did not accept a query. Run `pnpm db:migrate` and `pnpm db:seed` against this URL (see .env.example).",
      },
      { status: 503 },
    )
  }
}
