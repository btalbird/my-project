-- Enable Row Level Security (fixes Supabase Security Advisor: "RLS Disabled in Public").
--
-- This app reads/writes via Prisma using DATABASE_URL (typically the `postgres` role),
-- which bypasses RLS in Supabase — your API routes keep working.
--
-- `anon` / `authenticated` (Supabase Data API / PostgREST) have no policies on these tables
-- yet, so they cannot read or write rows until you add explicit policies (e.g. if you later
-- query these tables from the browser with Supabase Auth).

ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."RestaurantTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Tag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
