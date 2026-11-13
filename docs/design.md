# Design: the Washi theme

The site implements the **Washi** theme of the Claude Design handoff ("Go Hall of Fame"): paper, ink
and a vermilion seal, in light and dark. The handoff prototype is a design reference, not code; this
app recreates it with Tailwind 4 and Next.js.

## Tokens

All tokens are CSS variables in `src/styles/globals.css` and are exposed to Tailwind through
`@theme inline` (`bg-paper`, `text-ink`, `text-accent`, `border-divider`, `bg-accent-100`, ...).

+ Light: paper `#f1e9d6`, surface `#e8dcc0`, ink `#1c1a17`, accent `#c1321e`.
+ Dark: paper `#15130f`, surface `#211d17`, ink `#ece4d2`, accent `#e5604a`.
+ White stone `#f6f0e0` in both modes.
+ Divider is the ink at 35% alpha. `accent-100/200/300` mix the accent into the paper at 12/22/38%;
  `accent-600/700/800` mix it with black (light) or white (dark).
+ Page texture: two soft radial gradients (`--texture`).
+ Type: Geist (variable, all weights), Geist Mono for eyebrows and small labels through `next/font/google`, latin and latin-ext subsets, so
  the Han and Hangul characters fall back to the system sans (Hiragino Sans, Yu Gothic, PingFang
  SC, Apple SD Gothic Neo). Body 15px / 1.55; headings weight 800, no letter-spacing. The handoff
  used Shippori Mincho; Geist replaced it on request.
+ Radius 0 everywhere, 1px solid dividers, no shadows, no card boxes.

## Behaviour

+ Light/dark follows the system by default and can be switched with the nav button (`next-themes`,
  `class` strategy on `<html>`).
+ The nav collapses into a three-line menu button with a stacked link list as soon as its links would
  wrap (always below 720px; measured above that, so longer translations collapse sooner); hero H1 is 52px, page
  H1 40px; the games and timeline rows stack.
+ The country filter on `/players` is a link (`/players?country=Korea`), so it works without
  JavaScript and can be shared.

## Deliberate differences from the handoff

+ **Black stones in dark mode** use the paper colour (`--stone-black`) instead of the ink colour.
  The handoff colours black stones with the text colour, which makes them as light as the white
  stones in dark mode.
+ **The nomination confirmation** says the nomination is recorded for review, with the email on
  file. The handoff promised a confirmation email, but nothing sends mail yet.
+ **Intro copy** uses the live counts ("14 players and 5 games") instead of the words "Fourteen" and
  "five", so it stays right when the Hall grows.
+ **Nomination validation** requires a name as well as a valid email (the handoff only validated
  the email), and caps the lengths of all three text fields.
+ Shin Jinseo's native name is written 申眞諝 (the handoff had a mixed form).

## Photos

Every player uses the one placeholder portrait (`public/images/placeholder-portrait.jpg`), cropped
per player and shown in grayscale, as in the handoff. Real portraits need a licence. Set
`players.photo_url` once you have one (a path under `public/`, or a host added to
`images.remotePatterns`).

## Theme update (2026-11-13)

The second version of the handoff changed mostly the timeline and the type:

+ Timeline: a 2px centre line, events alternating left and right (right-aligned on the left),
  18px stones alternating ink and white, year 40px in the accent. Events within five years of the
  previous one stay on its side with a tighter gap (2016 and 2019). On mobile the line moves to the
  left and every event sits to its right. The placement rule is `layoutTimeline`.
+ Headings are weight 600 (h1 tracking -0.04em, others -0.02em). Eyebrows and labels use Geist Mono.
+ Shippori Mincho is used only for the 碁 seal, the giant 碁 and the vertical 囲碁殿堂 (desktop
  hero, left). The font files in `src/app/fonts/` are subsets of exactly those four glyphs.
+ Portraits get the ink-on-paper treatment: grayscale with contrast 1.1, blended with `multiply`
  over the paper colour (light) or `screen` over the surface colour (dark).


## The board (goban-web)

+ `packages/goban-web` is vendored from the neofanaro.io project and then changed for this site; the
  changes live in `packages/goban-web/dist/goban-web.js` and are small. Rebuilding the package from
  its own repository would drop them, so redo them if you do.
+ A `washi` theme draws the board like the diagram on the home page: no board fill (the paper shows
  through), an ink grid with a framed edge, ink and paper stones with a bold ink outline. Its colours
  are the site's CSS variables (`--ink`, `--stone`, `--stone-black`), so dark mode follows the page.
  Both boards (`go-board-player-client`, `game-preview-board-client`) use `theme="washi"`.
+ The theme also supports `gridStrokeWidth`, `frameStroke` and `frameStrokeWidth`.
+ The `highlight-move` attribute (a 1-based move) draws that move's stone in `--accent` once the game
  has reached it. The games list and the game page set it from the game's highlighted move.
+ The game page centers the board, puts the controls under it with the move counter right of the
  arrows (the play button stays under the board's center) and the players below. It opens on the
  highlighted move. The games list uses a non-interactive board that replays on hover.
+ The panels around the board (players, komi, the controls) read the `--goban-*` variables that
  `globals.css` sets on `:root`, and `--goban-radius: 0` squares their corners.

+ The home page shows a random game card and a random player card (a different pair on every
  visit), the same cards as the games and players lists.
