# Content and Go records

## Facts need verification

Bios, results, title counts and dates in `scripts/seed-data/` were written from memory in the
design handoff and have not been checked against sources. Verify them before publishing. In
particular check: the description of the opening in the Game of the Century, the title counts
(Sakata 64, Cho Chikun 75, Lee Changho 17 and Lee Sedol 18 world titles), the Super Go run of Nie
Weiping, and the years of every player.

## Adding an SGF to a game

The game page renders an interactive board (`goban-web`) when the game has an `sgf_url`. No SGF is
shipped yet, so no board is shown.

+ Put the file in `public/sgf/<game-slug>.sgf` (check the licence of the record first).
+ Set it: `update games set sgf_url = '/sgf/<game-slug>.sgf' where slug = '<game-slug>';`, or add an
  `sgfUrl` to the entry in `scripts/seed-data/games.ts` and run `pnpm db:seed`.
+ With `next start`, restart the server: it only serves the `public/` files that existed at startup.

## Adding a player or a game

+ Add the entry to `scripts/seed-data/players.ts` or `games.ts` and run `pnpm db:seed`. Players get
  their induction number from their position in the array, so append new players at the end.
+ A game lists the slugs of the inducted players who played it in `playerSlugs`.

## The goban packages

`packages/goban-web` and `packages/goban-web-react` are copies of the built packages from the
neofanaro.io project (source: the `goban_web` project). Update them by copying the new `dist/` and
`package.json` over, then `pnpm install`. Copying over the whole `dist/` would drop the Go Hall of
Fame edits (the `washi` theme and the highlighted move): see "The board" in [design.md](./design.md)
and redo them. The React wrapper is used in
`src/shared/go-board/presentation/go-board-player-client.tsx`, loaded with `ssr: false` because the
library registers custom elements.
