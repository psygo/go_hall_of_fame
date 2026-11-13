# Database

PostgreSQL through Drizzle ORM. The schema is `src/shared/database/data/schema.ts`; migrations are
generated into `drizzle/` and tracked in git.

## Local setup

+ Create the database once: `createdb go_hall_of_fame`.
+ Copy `.env.example` to `.env.local` and set `DATABASE_URL` (a local Postgres with no password is
  fine: `postgres://USER@localhost:5432/go_hall_of_fame`). `.env.local` is gitignored.
+ `pnpm db:migrate` applies the migrations. `pnpm db:seed` loads the content (it upserts players, games and
  criteria by slug or position and rewrites the timeline; it never deletes a player or game you
  removed from the seed files). `pnpm db:reset` empties every table (it refuses any database that
  is not on localhost), then seed again.
+ `DATABASE_URL` must also be set when running `next build` (the composition root reads it when the
  server modules load), so set it in CI and in the host's build environment.
+ After changing the schema: `pnpm db:generate` (writes a new SQL file in `drizzle/`), review it,
  then `pnpm db:migrate`.
+ The app uses `pg` with a `Pool`, so any Postgres URL works (Neon, Supabase, Vercel Postgres, ...).
  The connection is created in `src/config/wiring/infrastructure.ts` and reused across hot reloads.

## Tables

+ `contributors` (migration 0016): people and organizations that served the game; `kind` is person, organization or entity; `birth_year` (birth or founding) orders the list; migration 0017 added `entity` and `birth_year`. Migration 0018 adds `timeline_events.show_game_titles` (default true). Entered through the admin, no seed data. `timeline_event_contributors` links them to timeline events.
+ `players`: one row per inductee.
  + `slug` (unique, used in `/players/[slug]`), `induction_number` (unique, the "No. 01" of the
    Hall), `name`, `native_name`, `country` (enum `Japan | China | Korea | Others`), `years` (free text such
    as `1645–1702` or `b. 1983`), `birth_year` (integer: the lists are
    chronological by it; migration 0015 numbered the existing players by it), `distinction`, `bio`.
  + `photo_url` (null falls back to the placeholder portrait; use a path under `public/`, since
    an absolute URL needs its host in `images.remotePatterns` in `next.config.ts`; the portraits in `public/portraits/` are linked as `https://raw.githubusercontent.com/psygo/go_hall_of_fame/main/public/portraits/<slug>.jpg`, see [portraits.md](./portraits.md)) and `photo_position` (CSS
    `object-position`, so one photo can be cropped per player).
+ `games`: one row per legendary game.
  + `slug` (unique), `year`, `name`, `black`, `white`, `result`, `setting`, `description` (Markdown;
    it replaced `hook`, `moment` and `legacy`, which migration 0005 merged and 0006 dropped).
  + `black_player_id`, `white_player_id` (nullable, `set null` on delete): the Hall player behind the
    Black / White name. The name then links to that player's page, and the two players are the
    ones listed in `game_players`.
  + `tags` (`text[]`, empty by default; at most 8, also on `players`),
  + `highlight_move` (nullable: the move the preview stops on and draws in orange; null means 50),
    `sgf_url`: URL of the SGF record, and `sgf_text`: the text of an uploaded SGF file (it wins over
    the URL and is served at `/games/<slug>/sgf`). When either is set, the game page renders the
    board with `goban-web`, and the games list shows a preview. Lists never read `sgf_text`; they
    only learn whether it is set.
  + `sequence` orders games within the same year.
+ `game_players`: join table (`game_id`, `player_id`, composite primary key, cascade delete) linking
  a game to the inducted players who played it. Not every side is a player in the Hall (AlphaGo,
  Akaboshi Intetsu), which is why `black` and `white` are plain text on `games`.
+ `resources`: a titled link (`title` is the clickable text) with an optional `description`, on one game (`game_id`) or one player
  (`player_id`): a check constraint forbids both. With neither set, the row belongs to the public Resources page. `position` keeps the order.
+ `password_resets`: one-time reset links (`admin_id` cascade, `token_hash` unique, `expires_at`,
  `used_at`). Only the token's SHA-256 is stored.
+ `timeline_events`: `year` (free text), `position` (set by dragging in the admin), `title`, `text`.
+ `timeline_event_games` and `timeline_event_players`: the games and players an event is about (`event_id`, `game_id` / `player_id`, `position`; composite primary key, cascade delete).
+ `feedback`: what visitors send from the About page: `email`, `description`, `is_read`, `created_at`.
+ `players`, `games` and `timeline_events` each have `is_draft` (default false): drafts are visible to admins only.
+ `criteria`: the four induction criteria (`position` unique, `title`, `text`).
+ `admins`: `email` (unique), `name`, `password_hash` (scrypt), `failed_attempts`, `locked_until`.
+ `admin_sessions`: `admin_id` (cascade), `token_hash` (unique, SHA-256 of the cookie token),
  `expires_at`.
+ `site_texts`: editable page copy (`key` primary key, `value`). A key that is absent shows its
  default from `page-text.ts`.
+ `nominations`: what the form on `/induction` writes: `name`, `category` (`player | game`),
  `email`, `case_for_induction`, `status` (`pending | accepted | declined`, default `pending`),
  `created_at`. Review them at `/admin/nominations`. The domain caps the lengths
  (name 200, email 254, case 5000 characters). There is no rate limit or captcha yet.

## Seed data

`scripts/seed-data/` holds the content (players, games, timeline, criteria). It was transcribed from
the Claude Design handoff. See [content.md](./content.md) for what still needs verifying.
