import { NextResponse } from "next/server"

import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Deployment / parity check: open `/api/health` on Vercel vs localhost.
 * Does not expose secrets — only whether DATABASE_URL exists and DB answers.
 */
export async function GET() {
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL?.trim())
  const directUrlConfigured = Boolean(process.env.DIRECT_URL?.trim())

  if (!databaseUrlConfigured || !directUrlConfigured) {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlConfigured,
        directUrlConfigured,
        dbReachable: false,
        hint: "Set DATABASE_URL and DIRECT_URL on Vercel (Supabase: transaction pooler + session pooler — see .env.example), then redeploy.",
      },
      { status: 503 },
    )
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      ok: true,
      databaseUrlConfigured: true,
      directUrlConfigured: true,
      dbReachable: true,
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        databaseUrlConfigured: true,
        directUrlConfigured: true,
        dbReachable: false,
        hint: "DATABASE_URL/DIRECT_URL are set but the database did not accept a query. Run `pnpm db:migrate` and `pnpm db:seed` against this project (see .env.example).",
      },
      { status: 503 },
    )
  }
}
