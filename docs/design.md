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
+ Type: Shippori Mincho 400/600/800 through `next/font/google` (latin and latin-ext subsets, so
  the Han characters fall back to the system Mincho: Hiragino Mincho ProN or Yu Mincho). Body
  15px / 1.55; headings weight 800, no letter-spacing.
+ Radius 0 everywhere, 1px solid dividers, no shadows, no card boxes.

## Behaviour

+ Light/dark follows the system by default and can be switched with the nav button (`next-themes`,
  `class` strategy on `<html>`).
+ Below 720px the nav collapses into a Menu button with a stacked link list; hero H1 is 52px, page
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
