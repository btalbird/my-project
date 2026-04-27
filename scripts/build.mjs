/**
 * Vercel: apply Prisma migrations then `next build`.
 * Set DATABASE_URL (transaction pooler) and DIRECT_URL (session/direct) on the project — see .env.example (Supabase).
 * Local: `next build` only so you can build without a running Postgres.
 */
import { execSync } from "node:child_process"

const onVercel = process.env.VERCEL === "1"

function run(cmd) {
  execSync(cmd, { stdio: "inherit", env: process.env, shell: true })
}

if (onVercel) {
  run("prisma migrate deploy")
}

run("next build")
