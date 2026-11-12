# Codebase Audit Log

The codebase audit agent (see `CLAUDE.md`) runs every 20 commits. Each entry records the commit it
audited, the date, and a short summary of what it found and what was done about it. Before starting
a task, count the commits since the last entry with `git rev-list --count <commit>..HEAD`.

+ No whole-codebase audit has run yet. The first one is due 20 commits after the first commit.
+ 2026-11-12: before the first commit, the architecture, test-writing and test-running agents
  reviewed the initial build (this is not a codebase audit).
  + Fixed: a quadratic-time email regex reachable from the server action (now linear, with length
    caps checked first); the error boundary's retry (now `unstable_retry`); an idle-pool `error`
    event that could crash the process; `db:reset` only runs against localhost; dead code; missing
    `orderBy` tiebreakers; weak tests.
  + Open by choice: no rate limit or captcha on nominations; data sources have no unit tests (they
    chain Drizzle calls, so the seed and a manual run cover them); `created_at` columns are
    timezone-less; static home copy ("From Dosaku to Shin Jinseo") will drift as the Hall grows.
