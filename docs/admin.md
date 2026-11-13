# Admin (CMS)

The admin lives under `/admin`. There is no public sign-up: admins are created with
`pnpm admin:create` (see [deployment.md](./deployment.md)).

## What an admin can do

+ **Sign in** at `/admin/sign-in`. Once signed in, a round user icon with the admin's initials
  appears at the top right of every page. It opens a menu with the account, a link to the dashboard
  and Sign out.
+ **Edit buttons.** Every public page shows an edit button in the nav for admins, pointing at its
  editor: Home goes to Pages, Players to the player list, a player to that player's form, Games and
  a game likewise, Timeline to the timeline list, Induction to the criteria list. (The mapping is
  `src/shared/ui/presentation/admin-edit-target.ts`.)
+ **Dashboard** (`/admin`): counts, and the number of pending nominations.
+ **Pages** (`/admin/pages`): the editable copy of the public pages (headings, eyebrows, the home
  introduction and card texts). A blank field restores the original text, which lives in
  `src/features/content/domain/entities/page-text.ts`. The home introduction accepts the placeholders
  `{playerCount}` and `{gameCount}`.
+ **Drafts.** Players, games and timeline events have a "Draft" checkbox. A draft is visible to signed-in
  admins only (marked "Draft" in lists and on its page); visitors get a 404, and it is left out of the
  lists, search, neighbors, the home page counts and picks, and the timeline. A published item that
  links to a draft (a game's player, a timeline event's game) shows without the link. The rule lives in
  the data layer (`CanSeeDrafts`, supplied by the composition root), so no screen can forget it.
+ **Players** (`/admin/players`): create, edit, delete. Fields: name, native name, country (Japan,
  China, Korea or Others), years, **year of birth** (the Hall is listed chronologically by it),
  distinction, biography, slug, induction number, photo path and crop.
+ **Games** (`/admin/games`): create, edit, delete. A game has one Markdown description (it replaced
  the separate hook, moment and why-it-endures fields). Also the Black/White player links, the SGF, resources, the order within the
  year.
+ **Game Contributors** (`/admin/contributors`, public page `/contributors`): the people and organizations that served the game without
  being legendary players (Demis Hassabis, DeepMind, a professor who built a baduk department).
  Fields: name, kind (person or organization), what they contributed (one line), period (optional),
  Markdown biography, slug, photo path and crop, Draft. Public pages: `/contributors` (a grid) and
  `/contributors/<slug>`. Timeline events can link to them (see Timeline).
+ **Black and White links.** The game form has a "Black links to" and a "White links to" choice of
  Hall players. A linked name is a link to that player's page on the games list and the game page.
+ **SGF.** Two ways to give a game its record: a path or https URL, or an uploaded `.sgf` file (up to
  400 KB; its text is saved in the database). An uploaded file wins. If the form comes back with
  errors, choose the file again.
+ **Highlighted move.** An optional move number on the game form. The games-list preview plays up to
  that move and draws it in the accent color (orange-red, like the diagram on the home page); the
  game page draws the same stone once the game reaches it. Blank means move 50.
+ **Markdown.** The long-text fields (a player's biography, a game's description,
  a timeline event's description) accept Markdown: `**bold**`, `*italic*`, `[a link](https://…)`,
  lists and `> quotes`. Raw HTML and images are ignored. Lists and link previews show the plain text.
+ **Resource names.** Each resource has a name (the clickable text, shown like an anchor link without the
  address), an optional description and the link. The Resources page also has an editable description
  under Pages.
+ **Tags.** Optional on players and games: type them separated by commas (up to 8, 24 characters
  each; repeats in any case are dropped). They show on the cards and detail pages; on a detail page
  each tag links to the list searched for it, and the search boxes also match tags.
+ **Resources.** Games and players have a Resources list: a link and an optional description each,
  shown as a bulleted list on the public page. Links must be https or a path on this site.
+ **Timeline** (`/admin/timeline`): events with a year (free text, because old events have no exact
  date: `1846`, `c. 1670`, `Late 17th century`), a title and text, and any number of linked
  games, linked players and linked contributors (three fieldsets, each with a + button to add another row). With exactly one
  linked game the whole event is a link to that game's page; every other link is listed under the text. **Drag an event up or down** to reorder the timeline; each row also has buttons to move it to the top, 10 up, 1 up, 1 down, 10 down and to the bottom (these work from the keyboard too). A new event goes to the end. Events alternate sides of the line in that order.
+ **Resources** (`/admin/resources`): the links of the public Resources page (`/resources`): a link and
  an optional description each, as a bulleted list. Its heading and eyebrow are editable under Pages.
+ **Criteria** (`/admin/criteria`): the induction criteria.
+ **Feedback** (`/admin/feedback`): what visitors sent from the form at the bottom of the About page
  (an email and a description). Mark each read or new, or delete it. The form has a hidden field
  that bots fill: those submissions are accepted and dropped without being stored.
+ **Nominations** (`/admin/nominations`): what visitors submitted. Mark each accepted or declined, or
  delete it. Accepting a nomination does not create the player or game: add it yourself.

## Public lists

+ Players are listed chronologically by year of birth by default (oldest born first) and games newest
  first (most recent year). The other orders, including youngest born first and earliest or latest
  inducted, are in the Sort by menu.
+ Players, games, the timeline and the induction criteria have sorting. Players and games also have a
  search box that filters as you type, and players a country filter. All of it lives in the address
  (`?q=lee&sort=name&page=2`), so a result can be shared. The admin lists are paginated (15 a page).
+ Players (12 a page), games (6) and criteria (4) are paginated. The timeline loads 6 events at a time
  as you scroll, with skeleton placeholders while the next chunk loads.
+ Each games-list card with an SGF shows a board that cannot be played on. It rests on the
  highlighted move (move 50 by default, drawn in orange). While the pointer is on the card (or focus
  is inside it) the game replays from move 1, one move every 700 ms, and the board returns to the
  highlighted move when the pointer leaves. The whole card opens
  the game.

## Forgot your password

+ `/admin/forgot-password` (linked from the sign-in page) emails a one-time link to
  `/admin/reset-password?token=…`. The answer is the same whether or not the email belongs to an
  admin. A second request within a minute sends nothing. The link works once, for an hour; only
  its SHA-256 is stored, and a new request retires the old link.
+ Setting the new password (12 characters or more) also clears a lockout and signs the admin out
  everywhere. The reset page sends no `Referer` and is `noindex`.
+ Email needs `RESEND_API_KEY`, `EMAIL_FROM` and `SITE_URL` (see [deployment.md](./deployment.md)).
  Without them, `pnpm admin:create` with the same email still sets a new password.

## Share previews and icons

+ Every public page has an Open Graph / Twitter image (1200×630, the seal, the site name, a title and a
  line), generated by `next/og`: the home page, Players, Games, Timeline and Induction, plus one
  per player and per game.
+ `pnpm logo:generate` draws the logo from the site's seal font and writes `public/logo.svg` and
  `logo.png`, the favicon (`src/app/icon.svg`), the iPhone icon (`src/app/apple-icon.png`) and
  `logo-data.ts` (what the share images embed).

## Security model

+ Passwords are hashed with scrypt (Node's `crypto`), with a random salt. Signing in with an unknown
  email takes the same work as a wrong password, and the message is the same.
+ Five failed attempts lock the account for 15 minutes. The lock clears on a successful sign-in or
  with `pnpm admin:create`.
+ A session is a random 32-byte token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in
  production); only its SHA-256 is stored. It lasts 7 days and ends on sign-out (the row is deleted).
+ **Every admin page and every Server Action checks the session itself** (`RequireAdmin`, injected
  into each feature's admin state). Layouts do not protect Server Actions, which are public endpoints,
  so the layout check is only for the user interface. A test checks that the guard runs first.
+ A locked account answers faster than an unknown email, so after five attempts someone can tell that an
  account exists. Accepted for a small admin list; there is no public sign-up.
+ Admin pages send `noindex`.
+ Inputs are validated in the domain (lengths, slugs, safe URLs: a site path or https only), and all
  queries go through Drizzle's parameterization.
+ Not done: rate limiting (by IP, and of the public feedback and nomination forms, which have only a hidden
  field for bots),  two-factor sign-in, an audit log, per-admin roles (every admin can do
  everything).
