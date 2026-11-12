# Architecture Violations

This document lists the specific architecture violations to avoid in the codebase. They are
checked on every change (by Claude when it writes or reviews code, and by the author when
self-reviewing), and the import rules among them are enforced by `src/config/architecture.test.ts`.
Any change that contains them must be reworked before it is considered done.

1. **Data Layer Violations**
   + **1.1 General**
     + 1.1.1 Never import from the presentation layer.
     + 1.1.2 Do not import use cases.
     + 1.1.3 Never import React or Next.
   + **1.2 data-sources**
     + 1.2.1 Throw exceptions from here (do not use error codes or 'failure' objects).
     + 1.2.2 Convert raw rows to models or TypeScript primitive types, or trigger changes in the
       database: nothing more, nothing less.
     + 1.2.3 **ONLY PLACE TO CONNECT WITH external services: DATABASE/FILE SYSTEM/NETWORK/...**
     + 1.2.4 **ONLY PLACE TO IMPORT PROVIDERS (for example `drizzle-orm`, `pg`).** The shared
       database module (`shared/database/data`) owns the schema and the client factory.
   + **1.3 models**
     + 1.3.1 ALWAYS IMPLEMENT AN ENTITY from `domain/entities`.
     + 1.3.2 Contain a `toEntity()` method for conversion to entities.
     + 1.3.3 Contain a `fromRawData` static factory for conversion from raw external data to a
       model. Validate untyped input there; never cast with `as`.
   + **1.4 repositories**
     + 1.4.1 Name repository implementation classes `{Repository Interface Name}Impl`.
     + 1.4.2 Contain ONLY implementations of the interfaces in `domain/repositories`.
     + 1.4.3 ALWAYS RETURN a `DataState<Type>` when requesting data. Catch the data source
       exceptions here and turn them into `DataState` failures.
     + 1.4.4 **ONLY PLACE TO IMPORT data sources FROM.**

2. **Domain Layer Violations**
   + **2.1 General**
     + 2.1.1 NEVER IMPORT FROM ANY MODULE WITHIN THE APP (except the pure-TypeScript `src/core`),
       and never from any package (`react`, `next`, `drizzle-orm`, ...).
   + **2.2 entities**
     + 2.2.1 Do not implement any logic related to data fetching or presentation.
     + 2.2.2 Implement any BUSINESS LOGIC related to business objects here.
   + **2.3 use-cases**
     + 2.3.1 Each use case must implement a single business logic operation.
     + 2.3.2 Do not interact directly with the data layer; use repository interfaces.
       A use case may also depend on another use case through the `UseCase` interface; it never
       receives an `*Impl` or a data source.
   + **2.4 repositories**
     + 2.4.1 Do not contain any implementation details, only interfaces.
     + 2.4.2 Never return models from `data/models`; return `domain/entities` instead.

3. **Presentation Layer Violations**
   + **3.1 General**
     + 3.1.1 Do not access the data layer or use data providers (Drizzle, `pg`) directly.
     + 3.1.2 Avoid business logic in presentation components; use loaders/handlers for UI state
       and use cases for business logic.
   + **3.2 state (loaders, form handlers, server actions)**
     + 3.2.1 Only shape data for the UI (unwrap a `DataState`, parse a query parameter or a
       `FormData`); never hold business rules.
     + 3.2.2 ONLY PLACE to interact with use cases, and only through the `UseCase` interface
       injected by the composition root (never by importing a use case class).
     + 3.2.3 CAN ONLY INTERACT WITH USE CASES for any business logic operation (not repositories
       or the data layer).
   + **3.3 screens and routes**
     + 3.3.1 Screens only handle presentation and delegate business logic to loaders or use cases.
     + 3.3.2 Avoid dependencies on specific models; use entities or simplified data structures.
     + 3.3.3 Files in `src/app/` only render a screen and re-export its metadata. No logic, state
       or data imports. A page other than the home page must export `metadata` or
       `generateMetadata` (a test checks it).
   + **3.4 components**
     + 3.4.1 Components should be reusable and not tied to specific business logic.
     + 3.4.2 Receive data through props. A client component never imports `@/config/di`; a Server
       Component screen passes it what it needs.

4. **Module Boundaries** (checked by `src/config/architecture.test.ts`)
   + 4.1 A feature never imports another feature (`features/a` -> `features/b`). Code used by
     several features goes in `shared/`. Features therefore duplicate small read models on purpose
     (for example the game references inside a player profile). `shared/` never imports
     `features/` either.
   + 4.2 `features/` and `shared/` reach `config/` only through `config/di`.
   + 4.3 Only the composition root (`config/di.ts` and `config/wiring/*`) imports the wiring
     modules. A wiring module never imports `config/di`. The composition root is `server-only`.
   + 4.4 Side-effect imports (`import './x'`) count as imports for every rule above.
