# Codebase Audit Log

The codebase audit agent (see `CLAUDE.md`) runs every 20 commits. Each entry records the commit it
audited, the date, and a short summary of what it found and what was done about it. Before starting
a task, count the commits since the last entry with `git rev-list --count <commit>..HEAD`.

+ 2026-11-12: before the first commit, the architecture, test-writing and test-running agents
  reviewed the initial build (this is not a codebase audit).
  + Fixed: a quadratic-time email regex reachable from the server action (now linear, with length
    caps checked first); the error boundary's retry (now `unstable_retry`); an idle-pool `error`
    event that could crash the process; `db:reset` only runs against localhost; dead code; missing
    `orderBy` tiebreakers; weak tests.
  + Open by choice: no rate limit or captcha on nominations; data sources have no unit tests (they
    chain Drizzle calls, so the seed and a manual run cover them); `created_at` columns are
    timezone-less; static home copy ("From Dosaku to Shin Jinseo") will drift as the Hall grows.
+ 2026-11-13, commit `a0cef4f` (39 commits, the first whole-codebase audit): no high-severity findings;
  `pnpm check` green; admin guards (42 call sites), Markdown/link sanitising, redirects and tracked
  secrets all clean.
  + Fixed: docs/admin.md listed password-reset email as "not done" although it exists.
  + Open, to decide: no rate limit on the public feedback, nomination and forgot-password actions; no
    global security headers (CSP, `frame-ancestors` for `/admin/*`); in development the reset link is
    printed with the email when no email service is set (gated to non-production); large files
    (`auth-state.ts` 326 lines, `timeline-data-source.ts` 355) could be split; the timeline reorder
    runs one UPDATE per event; the timeline chunk `offset` has no upper bound; indexes on list
    ordering columns were not checked.
