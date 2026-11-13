# Deployment on Vercel

The app is a Next.js project with a Postgres database. On Vercel the database comes from a
Marketplace integration (Neon is the one Vercel offers for Postgres; Vercel's own Postgres product is
retired). The app talks to it with `pg`, so any Postgres works.

## Environment variables

+ `DATABASE_URL`: the pooled connection string. The app reads it (or `POSTGRES_URL` when
  `DATABASE_URL` is empty). Required at build time as well as at runtime.
+ `DATABASE_URL_UNPOOLED`: a direct connection. `pnpm db:migrate` prefers it (migrations should not
  go through a connection pooler). Optional.
+ The Neon integration also sets `PGHOST`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL` and others. The app
  ignores those.
+ No other secrets exist: sessions are random tokens stored hashed in the database, so there is no
  signing key to manage.

## One-time setup

1. **Create the database** in the Vercel dashboard: your project, Storage tab, add a Postgres
   database from the Marketplace (Neon), and connect it to the project for Production (and Preview if
   you want previews to have a database; see the warning below). Vercel adds the variables above to
   the project.
2. **Pull the variables locally** (optional): `vercel env pull .env.local`. Note that this makes
   `DATABASE_URL` in `.env.local` point at the hosted database, so every local `pnpm dev` and
   `pnpm db:*` then uses it. To keep a separate local database, leave `.env.local` pointing at it and
   pass the hosted URL inline for the one-off commands below.
3. **Create the tables:** `pnpm db:migrate` (applies everything in `drizzle/`). Inline form for a
   one-off against the hosted database:
   `DATABASE_URL_UNPOOLED="<hosted url>" pnpm db:migrate`.
4. **Load the content:** `DATABASE_URL="<hosted url>" pnpm db:seed`. It upserts the players, games,
   criteria and timeline from `scripts/seed-data/`. Run it once; later edits belong in the admin.
   Do not re-run it after editing in the admin: it overwrites the seeded entries and rewrites the
   timeline.
5. **Create the first admin:** `DATABASE_URL="<hosted url>" pnpm admin:create`. It asks for a name,
   an email and a password (at least 12 characters, typed hidden) and prints the database host it is
   about to write to. Run it again with the same email to reset a password and clear a lockout.
6. **Deploy** (push to the connected Git branch, or `vercel --prod`). Open `/admin/sign-in`.

`db:reset` refuses to run against any database that is not on localhost.

## Things to know

+ **Previews and the database.** If Preview deployments get the same `DATABASE_URL` as Production,
  anything done in a preview (including admin edits and nominations) hits the production data.
  Either give Preview its own database or branch, or scope the variable to Production only.
+ **Migrations are manual.** Nothing runs them on deploy. After changing the schema
  (`pnpm db:generate`), run `pnpm db:migrate` against each database before deploying the code that
  needs it. (Putting `pnpm db:migrate &&` in the Vercel build command is an option, at the price of
  every build, previews included, needing the database to be reachable and migrating it.)
+ **Connections.** `pg` is configured with a pool of at most 5 per server instance. Use the pooled
  `DATABASE_URL` at runtime so many instances do not exhaust the database's connection limit.
+ **Images.** Portraits are not in the database: `players.photo_url` holds a path under `public/` or
  an https URL. An https URL also needs its host in `images.remotePatterns` in `next.config.ts`.
+ **Cookies.** In production the session cookie is `__Host-ghof_session` (HTTPS only, no domain), so
  the admin does not work over plain HTTP outside localhost.
+ Vercel's dashboard and the Neon integration change over time: check the current Vercel storage
  documentation if a step above no longer matches what you see.
