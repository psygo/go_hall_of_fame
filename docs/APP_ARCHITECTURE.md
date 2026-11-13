# Go Hall of Fame App Architecture

Go Hall of Fame is a Next.js (App Router) + TypeScript app backed by PostgreSQL through Drizzle ORM.
It follows an adaptation of Clean Architecture (carried over from the CrossLang project, which is
React Native): the software is split into three layers (presentation, domain, data), each with a
specific responsibility and a restrictive set of allowed imports, as explained
[below](#clean-folders).

## Stack

+ Next.js 16 (App Router, React 19, Server Components first), TypeScript in strict mode.
+ Styling: Tailwind CSS 4 with the Washi tokens in `src/styles/globals.css` (see [design.md](./design.md)).
  Light/dark through `next-themes` (class strategy).
+ Data: PostgreSQL through Drizzle ORM (`drizzle-orm/node-postgres`, `pg`). Only data sources know it
  exists. See [database.md](./database.md).
+ Go boards: `goban-web` and `goban-web-react`, vendored in `packages/` and installed as `file:`
  dependencies. Used only by `src/shared/go-board/presentation`.
+ Presentation state: there is no client store. Pages are Server Components that await **loaders**
  (see [Presentation](#presentation-layer)). The few interactive pieces (nav, theme toggle,
  nomination form, board) are small client components.
+ Tests: Vitest for domain, data and architecture (`src/**/*.test.ts`).

## Admin and authorization

See [admin.md](./admin.md) for what the admin does. Architecturally: `features/auth` owns sessions.
Other features never import it. Instead the composition root gives each feature's admin state a
`RequireAdmin` function (`src/core/admin-guard.ts`, built in `config/wiring/auth.ts`), which every
admin loader and every mutation calls first. The root layout is built by the auth feature's
`AppShellScreen` (it needs the current admin for the nav).

## Folder Structure of the Repo

+ `src/app/`: App Router routes ONLY. Each file is a thin wrapper that renders a screen from
  `src/features/*/presentation/screens` and re-exports its metadata from
  `src/features/*/presentation/metadata`. No logic, no state, no imports from data or domain.
+ `src/config/`
  + `di.ts`: the entry point of the composition root. It re-exports the ready-made loaders that
    `wiring/` builds (see [Dependency wiring](#dependency-wiring)). `server-only`.
  + `wiring/`: the rest of the composition root, one module per feature (`players.ts`, `games.ts`,
    ...) plus `infrastructure.ts` (the database connection). `server-only`.
  + `architecture-rules.ts` and `architecture.test.ts`: the import rules as code, run by `pnpm test`.
+ `src/core/`: pure TypeScript shared by every layer (no React, no Next, no platform code)
  + `use-case.ts`: the `UseCase` interface
  + `data-state.ts`: the `DataState<T>` type and helpers
  + `raw-data.ts`: validation helpers for `fromRawData` (no `as` casts)
  + `circular-neighbors.ts`: previous/next with wrap-around
  + `list-query.ts`: pages (`paginate`), chunks for infinite scroll (`sliceFrom`), word search
    (`matchesQuery`) and the parsing of `q`/`sort`/`page` parameters
  + `resources.ts`: the link-with-description type and its validation
+ `src/shared/{name}/`: same shape as a feature, for code used by several features (a folder may
  have only the layers it needs). Today: `shared/database` (data only: Drizzle schema and client),
  `shared/ui` and `shared/go-board` (presentation only).
+ `src/features/{feature}/`: `players`, `games`, `timeline`, `induction` (criteria and nominations),
  `contributors` (people and organizations that served the game, and their pages), `home`, `about` (the About page and its feedback form), `content` (editable page texts), `auth` (admin sign-in and sessions), `dashboard` (the
  admin counts). Each feature owns the admin editing of its own data (its `*-admin-state.ts`,
  forms and admin screens); the routes under `src/app/admin/` just render them.
  + `data/`
    + `data-sources/`
    + `models/`
    + `repositories/`
  + `domain/`
    + `entities/`
    + `params/`
    + `repositories/`
    + `use-cases/`
  + `presentation/`
    + `state/`: loader factories and form-state handlers (the server-side "stores"), `"use server"`
      actions
    + `screens/`: Server Components
    + `components/`: reusable and client components
    + `metadata/`: route metadata
+ `src/styles/`: global CSS.
+ `packages/`: the vendored goban packages (not linted, not type-checked by the app).
+ `drizzle/`: generated SQL migrations. `scripts/`: seed and reset scripts.
+ `docs/`: all documentation.

Tests live **next to the file they test** as a sibling named `{file-name}.test.ts`, never inside
`src/app/` and not in a separate top-level tree. For example the test for
`src/features/players/domain/entities/player.ts` is
`src/features/players/domain/entities/player.test.ts`.

File names are `kebab-case`. Types, interfaces and classes are `PascalCase`. Functions and
variables are `camelCase`.

## Clean Folders

All the functionality of the app follows a clean structure. When used, the 3 layers together form
a _clean folder_ and they satisfy a set of very restrictive conditions. The violations of these
restrictions are listed [here](./ARCHITECTURE_VIOLATIONS.md).

### Clean Folder Requirements

1. A clean folder is divided into 3 layers (represented as folders):
   A. Data Layer
   B. Domain Layer (Business Logic)
   C. Presentation Layer (UI)
   This is ALWAYS THE CASE, no exceptions.
2. **Imports flow in one direction:**

```
presentation  -->  domain  <--  data
```

+ The Data Layer can only import from the Domain Layer.
+ The Presentation Layer can only import from the Domain Layer.
+ The Domain Layer is self-sustained: it imports nothing from the app (no React, no Next, no
  Drizzle, no other layers) except `src/core`, which is itself pure TypeScript.

#### Layer Requirements

##### Data Layer

+ **Dependencies**: relies exclusively on the Domain Layer (and `core`, and `shared/*/data`).
+ **Structure**: three main components:
  1. **Data Sources**:
     + The sole classes in the codebase that interact with external services (the database,
       `fetch`, the file system, any third-party package that talks to the outside world).
     + Receive their `Database` in the constructor, so they can be faked.
     + Used by repository implementations for external data access.
  2. **Models**:
     + Implement entity types from the Domain Layer.
     + Parse raw data (database rows, JSON) into business objects with `fromRawData`, keeping the
       same fields, and convert back with `toEntity()`.
  3. **Repository Implementations**:
     + Fulfil the contracts (interfaces) defined by the Domain Layer's repositories.
     + Handle data source interactions through models and return `DataState<T>`.

##### Domain Layer

+ **Dependencies**: does **not** rely on any project dependency and is implemented in plain
  TypeScript.
+ **Focus**: solely concerned with business logic, abstracting away implementation details.
+ **Structure**:
  1. **Entities**:
     + Business objects used across the app. They implement business logic (for example: filtering
       players by country, wrap-around neighbors, nomination validation and normalization, the
       centuries a timeline spans), without concerning themselves with data parsing (Models) or UI
       presentation (Presentation Layer).
  2. **Params**:
     + Types that represent the parameters of use cases, for example
       `ListPlayersParams { country }`.
  3. **Use Cases**:
     + A piece of business logic that represents a single task the system performs.
     + Implements the `UseCase` interface with a `call` method and uses repository interfaces.
       Examples: `ListPlayers`, `GetPlayerProfile`, `GetGameProfile`, `SubmitNomination`.
  4. **Repository Interfaces**:
     + Interfaces describing what the features need from the outside world.
     + Imported by use cases but implemented by the Data Layer, which decouples business logic
       from the database and from UI choices.

##### Presentation Layer

+ **Dependencies**: only interacts with the Domain Layer, specifically with use cases, and only
  from `state`.
+ **Structure**:
  1. **State** (`presentation/state`): loader factories (`createPlayersLoaders`, ...) and
     form-state handlers (`createInductionState`). They receive use cases as constructor
     dependencies typed by the `UseCase` interface, call them, and shape the result for a screen:
     `unwrapDataState` (a failure throws, so the route's `error.tsx` renders), `notFound()`,
     `connection()` (opts the page into dynamic rendering, since the data lives in a database).
     Mutations are `"use server"` actions in this folder that delegate to a handler.
  2. **Screens**: Server Components. They await a loader from `@/config/di` and render.
  3. **Components**: reusable, receive data through props. Client components live here and never
     import `@/config/di`.
  4. **Metadata**: `metadata` constants and `generateMetadata` builders (they may call a loader;
     loaders that take a slug are wrapped in React `cache` so the page and its metadata share one
     query).

#### Exceptions

Apart from this, the data, domain and presentation layers can import from `core` and `shared`
(respecting the hierarchy; the presentation layer can never import from the data layer).

### Dependency wiring

Because the presentation layer may not import the data layer, something has to connect them.
`src/config/di.ts` and the modules in `src/config/wiring/` are the composition root: the only
modules allowed to import data-layer repository implementations together with domain use cases.
`di.ts` only re-exports what the wiring modules build; the wiring modules never import `di.ts`,
and nothing outside the composition root imports them (the architecture test checks it). They build
the data sources, the repository implementations and the use cases, hand the use cases to the
loader factories defined in `presentation/state`, and export the ready-made loaders (for example
`playersLoaders`). `infrastructure.ts` creates the one `Database` and reuses it across hot reloads.

Presentation code may import those ready-made loaders from `@/config/di` (screens, state and
metadata only). It never constructs a repository, data source or use case, and never imports a
data-layer class. Everything in the composition root is `server-only`.
