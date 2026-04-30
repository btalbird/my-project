-- Optional: run once in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- if you want a dedicated DB role for Prisma instead of using the default `postgres` user in URIs.
-- Then use user `prisma` in DATABASE_URL (see .env.example).
-- Docs: https://supabase.com/docs/guides/database/prisma

create user "prisma" with password 'REPLACE_WITH_STRONG_PASSWORD' bypassrls createdb;

grant "prisma" to "postgres";

grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
