# Admin (CMS)

The admin lives under `/admin`. There is no public sign-up: admins are created with
`pnpm admin:create` (see [deployment.md](./deployment.md)).

## What an admin can do

- **Sign in** at `/admin/sign-in`. Once signed in, a round user icon with the admin's initials
  appears at the top right of every page. It opens a menu with the account, a link to the dashboard
  and Sign out.
- **Edit buttons.** Every public page shows an edit button in the nav for admins, pointing at its
  editor: Home goes to Pages, Players to the player list, a player to that player's form, Games and
  a game likewise, Timeline to the timeline list, Induction to the criteria list. (The mapping is
  `src/shared/ui/presentation/admin-edit-target.ts`.)
- **Dashboard** (`/admin`): counts, and the number of pending nominations.
- **Pages** (`/admin/pages`): the editable copy of the public pages (headings, eyebrows, the home
  introduction and card texts). A blank field restores the original text, which lives in
  `src/features/content/domain/entities/page-text.ts`. The home introduction accepts the placeholders
  `{playerCount}` and `{gameCount}`.
- **Players** (`/admin/players`): create, edit, delete. Fields: name, native name, country, years,
  distinction, biography, slug, induction number, photo path and crop, and "featured on the home
  page" (only one player is featured at a time).
- **Games** (`/admin/games`): create, edit, delete. Also the players in the Hall who played the
  game, the SGF path (the board appears on the game page when set), the order within the year, and
  "featured".
- **Timeline** (`/admin/timeline`): events with a year, title and text. The side an event appears on
  is computed: events alternate, and events within five years of the previous one stay on its side.
- **Criteria** (`/admin/criteria`): the induction criteria.
- **Nominations** (`/admin/nominations`): what visitors submitted. Mark each accepted or declined, or
  delete it. Accepting a nomination does not create the player or game: add it yourself.

## Security model

- Passwords are hashed with scrypt (Node's `crypto`), with a random salt. Signing in with an unknown
  email takes the same work as a wrong password, and the message is the same.
- Five failed attempts lock the account for 15 minutes. The lock clears on a successful sign-in or
  with `pnpm admin:create`.
- A session is a random 32-byte token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in
  production); only its SHA-256 is stored. It lasts 7 days and ends on sign-out (the row is deleted).
- **Every admin page and every Server Action checks the session itself** (`RequireAdmin`, injected
  into each feature's admin state). Layouts do not protect Server Actions, which are public endpoints,
  so the layout check is only for the user interface. A test checks that the guard runs first.
- A locked account answers faster than an unknown email, so after five attempts someone can tell that an
  account exists. Accepted for a small admin list; there is no public sign-up.
- Admin pages send `noindex`.
- Inputs are validated in the domain (lengths, slugs, safe URLs: a site path or https only), and all
  queries go through Drizzle's parameterization.
- Not done: rate limiting by IP, two-factor sign-in, an audit log, per-admin roles (every admin can do
  everything), and email for password resets.
