import path from "node:path"
import { fileURLToPath } from "node:url"

import EmbeddedPostgres from "embedded-postgres"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")

const port = Number(process.env.PGPORT ?? "5432")
const user = process.env.PGUSER ?? "postgres"
const password = process.env.PGPASSWORD ?? "postgres"

const pg = new EmbeddedPostgres({
  databaseDir: path.join(repoRoot, ".embedded-postgres", "data"),
  user,
  password,
  port,
  persistent: true,
})

try {
  await pg.initialise()
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  if (!msg.includes("exists but is not empty")) throw err
}
await pg.start()
try {
  await pg.createDatabase("in_the_kitchen")
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  if (!msg.includes('database "in_the_kitchen" already exists')) throw err
}

console.log("Postgres ready")
console.log(`port=${port}`)
console.log(`db=in_the_kitchen`)
console.log(`postgresql://${user}:${password}@localhost:${port}/in_the_kitchen?schema=public`)

// Keep running
await new Promise(() => {})

