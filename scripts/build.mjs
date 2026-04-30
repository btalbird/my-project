/**
 * Vercel: apply Prisma migrations then `next build`.
 * Set DATABASE_URL on the project (Supabase session pooler recommended — see .env.example).
 * Local: `next build` only so you can build without a running Postgres.
 */
import { execSync } from "node:child_process"

const onVercel = process.env.VERCEL === "1"

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env, shell: true })
}

if (onVercel) {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(`
[build] DATABASE_URL is not set in this Vercel build.

Fix (dashboard):
  1. Vercel → your project → Settings → Environment Variables
  2. Add or edit DATABASE_URL (exact name, case-sensitive)
  3. Under "Environments", check Production (and Preview if this deploy is Preview)
     — variables scoped only to "Development" are NOT available to Vercel builds.
  4. Save, then Redeploy.

See .env.example for the Supabase connection string shape.
`)
    process.exit(1)
  }
  run("prisma migrate deploy")
}

run("next build")
