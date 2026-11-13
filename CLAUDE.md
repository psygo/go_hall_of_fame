# Go Hall of Fame — Rules for Claude

Go Hall of Fame is a website honouring the game of Go: legendary **players**, legendary **games**, a
timeline, and a nomination form. It is a Clean Architecture **Next.js** (App Router) + TypeScript +
**Drizzle ORM** + **PostgreSQL** project. The visual design is the Washi theme (paper, ink, a
vermilion seal), light and dark. Boards are rendered by `goban-web` (see `packages/`).

The checklist below is a quick reference derived from the full docs, which are imported at the
bottom of this file (they live in `docs/`). **The docs are the source of truth** — if the checklist
ever seems to conflict with them, the docs win.

## Project conventions

- **Never edit `README.md` or `TODO.md`.** They belong to the user. Don't "tidy" them either, and
  don't create them. If they show up as new or modified in `git status`, commit them exactly as
  written: "don't touch" means don't change the content, not "leave them out of git".
- **All documentation you write goes in `docs/`** (Markdown, `+` bullets for lists). Don't create
  documentation files at the repo root (this file is the one exception).
- **Git:** commit your work as you go, in small coherent commits with a clear message (what and
  why). Check `git status` first and stage only the files that belong to the change. If an `origin`
  remote exists, push after every commit. Never force-push or rewrite history without asking.
- **Secrets.** `.env.local` is gitignored and must stay that way: never commit it, never print its
  values, never paste them into docs, commit messages or code. Only `.env.example` is tracked.
  `DATABASE_URL` is server-only: never prefix a secret with `NEXT_PUBLIC_` (those values are
  compiled into the browser bundle). Before committing, check `git diff --cached` for key-like
  strings.
- Package manager is `pnpm`. Don't introduce npm or yarn lockfiles.
- Skills live in `.agents/skills/`, symlinked from `.claude/skills/`. Keep them tracked (never
  gitignore them) and don't edit them by hand.
- Code style: Prettier (`.prettierrc`: no semicolons, 60 columns, Tailwind class sorting). Run
  `npx prettier --write` on what you touched.
- **Next.js changes between versions — do not trust your training data.** Before writing code that
  touches a Next.js API (routing, caching, `params`/`searchParams`, server actions, metadata,
  fonts, images), read the bundled docs for the installed version in
  `node_modules/next/dist/docs/` (start at `index.md`). Check `node_modules/next/package.json`
  for the version. Note that `params` and `searchParams` are Promises, and `next lint` no longer
  exists (`pnpm lint` runs ESLint directly).

## Layer import direction (never violate)

```demo
presentation  -->  domain  <--  data
```

- `domain` imports nothing from the app: no React, no Next, no Drizzle, no other layer. Only the
  pure-TypeScript `src/core` and its own files.
- `data` imports only from `domain` (+ `core`, + shared data such as `shared/database/data`).
- `presentation` imports only from `domain` (+ `core`/`shared`), and reaches data only through the
  ready-made loaders and actions exported by `src/config/di.ts`. It never constructs or imports a
  use case class, a repository or a data source.
- `src/config/di.ts` and `src/config/wiring/*` are the one composition root allowed to wire
  repository implementations into use cases and loader factories. They are `server-only`.
- Before adding any `import` inside `src/features/**` or `src/shared/**`, check: does this import
  cross a layer boundary in the wrong direction? If yes, stop and restructure.
- `src/config/architecture.test.ts` enforces all of this on every `pnpm test`.

## Per-folder rules (quick checklist)

- `data/data-sources/*`: the ONLY place that touches external services (the database through
  Drizzle, `fetch`, the file system, any provider package). Throws exceptions, never returns error
  codes or failure objects. Converts raw rows to models/primitives only — no business logic.
- `data/models/*`: each model implements a `domain/entities` type, has a static `fromRawData(...)`
  (validate untyped input, no `as` casts) and `toEntity()`.
- `data/repositories/*`: classes named `{Interface}Impl`, implement ONLY interfaces from
  `domain/repositories`, return `DataState<T>`, and are the only place that imports data sources.
- `domain/entities/*`: business objects + business logic only. No data fetching, no presentation.
- `domain/use-cases/*`: one use case = one business operation, a class with a `call` method. Calls
  repository interfaces only (never an `*Impl` or a data source).
- `domain/repositories/*`: interfaces only, return entities (never models).
- `presentation/state/*`: the server-side equivalent of a store. **Loader factories** (read:
  `createPlayersLoaders({ ...useCases })`) and **form-state handlers** call use cases and shape the
  result for a screen (unwrapping `DataState`, `notFound()`, `connection()`). The ONLY presentation
  code allowed to call use cases. No JSX here. Mutations are `"use server"` actions that delegate to
  these handlers.
- `presentation/screens/*`: server components. Await a loader from `@/config/di`, render, nothing
  else. No data-layer imports, no direct use case calls, no `data/models` types.
- `presentation/components/*`: reusable, receive data through props. Client components (`"use
  client"`) live here. They never import `@/config/di` (it is `server-only`).
- `presentation/metadata/*`: `metadata` constants and `generateMetadata` builders for the routes.
- `src/app/*` (App Router): thin wrappers. A route file re-exports or renders a screen and its
  metadata, and nothing else. Never put test files here.
- Database schema: `src/shared/database/data/schema.ts` (Drizzle). Change it, then `pnpm
  db:generate` and `pnpm db:migrate`. Migrations are in `drizzle/` and are tracked.

## Admin and security rules

- Admin screens and actions: the first line of every admin loader and mutation is `requireAdmin()`
  (injected by the composition root, `RequireAdmin` in `src/core/admin-guard.ts`). Server Actions are
  public endpoints, so a layout guard is not protection. See `docs/admin.md`.
- Never log secrets or whole errors from the data layer (drivers echo query parameters): log
  `error.name`. Never put a password, token or hash in a doc, a commit, or a test fixture that looks
  real.
- A client component never imports a value from `presentation/state` (types only, with `import
  type`). Shared constants go in a plain module.
- Local work must not touch a hosted database: `.env.local` may contain a remote `DATABASE_URL`
  (pulled from Vercel). Override it inline (`DATABASE_URL=... pnpm dev`) or use a separate env file,
  and never run `db:seed`, `db:migrate` or `admin:create` against a hosted database without being
  asked. See `docs/deployment.md`.

## Testing requirement (always, not just when asked)

- Any new or changed **domain logic** (entities with behavior, use cases), **core helpers**, or
  **data-layer logic** (repository impls, data sources, models' `fromRawData`/`toEntity`) MUST ship
  with a test, in the same commit that adds the functionality — not as a follow-up.
- Tests live next to the file they test, as a sibling `{file-name}.test.ts`, e.g.
  `src/features/players/domain/entities/player.test.ts`. Never in `src/app/`.
- Frontend/UI code (`presentation/screens`, `presentation/components`, styling, layout) is exempt.
- `presentation/state` sits in between: test a loader or form handler when it contains non-trivial
  logic (branching, parsing), not when it only forwards a use case call.
- Tests-after-the-fact are fine; no tests is not. Writing the failing test first is encouraged for
  algorithms and business rules (validation, neighbor wrap-around, filtering).
- Use `vi.fn()` or small hand-written fakes for repository interfaces in use-case tests and for data
  sources in repository tests; pure entity logic needs no mocking. Data sources are tested against a
  fake `Database` only when worth it; otherwise they are covered by the seed and the manual run.
- Run tests with `pnpm test`, type-check with `pnpm typecheck`, lint with `pnpm lint`; `pnpm check`
  runs all three.

## Coding guidelines (from `docs/CODING_GUIDELINES.md`)

- Boy Scout Rule: when touching a file, leave it cleaner (tests for untested code you touch, small
  refactors you notice) — but don't scope-creep into unrelated files.
- Meaningful, pronounceable, intention-revealing names; types/classes are nouns, functions are
  verbs; follow the existing convention per file type (use case, `*Impl`, entity, model, loader).
- Functions: small, nesting depth ≤ 2, single responsibility, ≤ 3 args (prefer fewer; group into a
  params object), command/query separation.
- Classes: small, single responsibility, few instance variables.
- Prefer interfaces at layer boundaries (repository interfaces, etc).
- TypeScript: `strict` on, no `any` (use `unknown` and narrow), no `!` or `as` casts to silence the
  compiler outside tests, `readonly` data, discriminated unions over boolean flags, named exports
  (Next's required default exports for `page`, `layout`, `error` and `not-found` are the exception),
  `kebab-case` file names.

## Separate agents for tests, architecture and audits (always)

Writing, reviewing and running are done by different agents, so the one that wrote the code does not
also mark its own homework. Launch each as its own agent (the Agent tool), with a prompt that names
the files or the commits to look at, because a new agent starts without this conversation.

1. **Test-writing agent.** Writes the tests for new or changed code (see the testing requirement
   above). It only adds or edits test files, and reports any bug it finds instead of fixing it
   silently. Launch it after a feature is built, in the background if the work allows.
2. **Architecture agent.** Checks the change against the layer direction, the per-folder rules,
   `docs/ARCHITECTURE_VIOLATIONS.md` (by section number) and `docs/CODING_GUIDELINES.md` (by rule
   number). It reads and reports; it does not edit. Launch it before the change is called done.
3. **Test-running agent.** Runs the whole suite (`pnpm test`, `pnpm typecheck`, `pnpm lint`) and
   goes over **all the current tests**, not only the new ones: failing, skipped (`it.skip`,
   `it.todo`) or flaky tests, tests that assert nothing, duplicates, tests that no longer match the
   code, and domain or data code without a test. It reports what it found and fixes nothing unless
   asked.
4. **Codebase audit agent.** A fourth, separate agent that reads the **whole codebase**, not a diff:
   `src/`, `scripts/`, `drizzle/` and `docs/`. It looks for what per-change reviews miss: layer
   violations that crept in over time, dead code and unused exports, duplicated logic, files and
   functions that outgrew the guidelines, inconsistencies between the docs and the code,
   dependency and config drift, secrets or key-like strings in tracked files, and risky places
   (error handling, data loss, security, performance, queries inside loops). It reads and reports;
   it does not edit. **Run it every 20 commits.** `docs/audit-log.md` records the commit of the last
   audit. Before starting a task, check `git rev-list --count <that commit>..HEAD`; at 20 or more,
   launch the audit agent first (in the background), then add an entry to the log with the new
   commit hash, the date and a short summary of what it found and what was done about it.

Fix what the agents report, then have the one that raised it check again. Their reports go to the
user in short form, with what was found and what was changed.

## Workflow checklist before considering any change done

1. Does every new/changed `import` respect the layer direction above?
2. Does the new code live in the correct folder for what it does (not just where it's convenient)?
3. If I added a model, does it implement an entity and have `toEntity()`/`fromRawData`?
4. If I added a repository, is it an interface in `domain/repositories` with an `Impl` in
   `data/repositories`?
5. If I added a use case, does it do exactly one thing and only call repository interfaces?
6. If I added a table or column: schema change, generated migration, seed data and model updated?
7. Did I add/update a sibling `*.test.ts` for domain/data changes? Required, not optional.
8. Re-read `docs/ARCHITECTURE_VIOLATIONS.md` section numbers (e.g. 1.2.4, 3.2.3, 4.1) and check
   the diff against them explicitly — don't rely on memory of this file alone.
9. Did the test-writing, architecture and test-running agents each run (and, every 20 commits, the
   codebase audit agent) and their findings get dealt with? Did `pnpm check` pass? Did I commit (and
   push, if there is a remote), and leave `README.md`/`TODO.md` alone?

---

## Full docs (imported)

@docs/APP_ARCHITECTURE.md
@docs/ARCHITECTURE_VIOLATIONS.md
@docs/CODING_GUIDELINES.md
@docs/admin.md
