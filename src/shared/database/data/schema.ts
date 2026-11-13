import { sql } from "drizzle-orm"
import {
  check,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const countryEnum = pgEnum("country", [
  "Japan",
  "China",
  "Korea",
  "Others",
])

export const nominationCategoryEnum = pgEnum(
  "nomination_category",
  ["player", "game"],
)

export const nominationStatusEnum = pgEnum(
  "nomination_status",
  ["pending", "accepted", "declined"],
)

export const playersTable = pgTable("players", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  /** The "No. 01" of the Hall: the order of induction. */
  inductionNumber: integer("induction_number")
    .notNull()
    .unique(),
  name: text().notNull(),
  nativeName: text("native_name").notNull(),
  country: countryEnum().notNull(),
  /** Free text such as "1645–1702" or "b. 1983". */
  years: text().notNull(),
  distinction: text().notNull(),
  bio: text().notNull(),
  photoUrl: text("photo_url"),
  /** CSS object-position, so one photo can be cropped per player while portraits are placeholders. */
  photoPosition: text("photo_position")
    .notNull()
    .default("50% 50%"),
  /** Optional short labels, at most 8. */
  tags: text()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const gamesTable = pgTable("games", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  year: integer().notNull(),
  name: text().notNull(),
  black: text().notNull(),
  white: text().notNull(),
  /** The Hall player behind the Black / White name, when there is one (links to their page). */
  blackPlayerId: integer("black_player_id").references(
    () => playersTable.id,
    { onDelete: "set null" },
  ),
  whitePlayerId: integer("white_player_id").references(
    () => playersTable.id,
    { onDelete: "set null" },
  ),
  result: text().notNull(),
  setting: text().notNull(),
  /** What the game is about, in Markdown: one field that replaced hook, moment and legacy. */
  description: text().notNull().default(""),
  /** URL of an SGF record, rendered by goban-web when present. */
  sgfUrl: text("sgf_url"),
  /** The text of an uploaded SGF file. It wins over `sgfUrl` and is served at /games/{slug}/sgf. */
  sgfText: text("sgf_text"),
  /** The move (1-based) the preview stops on and draws in the accent color; null means move 50. */
  highlightMove: integer("highlight_move"),
  /** Orders games with the same year. */
  sequence: integer().notNull().default(0),
  /** Optional short labels, at most 8. */
  tags: text()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const gamePlayersTable = pgTable(
  "game_players",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => gamesTable.id, {
        onDelete: "cascade",
      }),
    playerId: integer("player_id")
      .notNull()
      .references(() => playersTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.playerId] }),
  ],
)

/**
 * A link with an optional description, listed on a game's or a player's page, or (with no owner) on
 * the Resources page.
 */
export const resourcesTable = pgTable(
  "resources",
  {
    id: serial().primaryKey(),
    gameId: integer("game_id").references(
      () => gamesTable.id,
      { onDelete: "cascade" },
    ),
    playerId: integer("player_id").references(
      () => playersTable.id,
      { onDelete: "cascade" },
    ),
    /** The clickable text of the link. */
    title: text().notNull().default(""),
    url: text().notNull(),
    description: text(),
    position: integer().notNull().default(0),
  },
  (table) => [
    check(
      "resources_at_most_one_owner",
      sql`(${table.gameId} is null) or (${table.playerId} is null)`,
    ),
  ],
)

export const timelineEventsTable = pgTable(
  "timeline_events",
  {
    id: serial().primaryKey(),
    gameId: integer("game_id").references(
      () => gamesTable.id,
      {
        onDelete: "set null",
      },
    ),
    /** As written, because old events have no exact date: "1846", "c. 1670", "Late 17th century". */
    year: text().notNull(),
    /** The place in the timeline, set by dragging in the admin (0 is first). */
    position: integer().notNull().default(0),
    title: text().notNull(),
    text: text().notNull(),
  },
)

export const criteriaTable = pgTable("criteria", {
  id: serial().primaryKey(),
  position: integer().notNull().unique(),
  title: text().notNull(),
  text: text().notNull(),
})

export const nominationsTable = pgTable("nominations", {
  id: serial().primaryKey(),
  name: text().notNull(),
  category: nominationCategoryEnum().notNull(),
  email: text().notNull(),
  caseForInduction: text("case_for_induction").notNull(),
  status: nominationStatusEnum()
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const adminsTable = pgTable("admins", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  name: text().notNull(),
  /** scrypt hash in the form scrypt$N$r$p$salt$hash. Never the password. */
  passwordHash: text("password_hash").notNull(),
  failedAttempts: integer("failed_attempts")
    .notNull()
    .default(0),
  lockedUntil: timestamp("locked_until", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const adminSessionsTable = pgTable(
  "admin_sessions",
  {
    id: serial().primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => adminsTable.id, {
        onDelete: "cascade",
      }),
    /** SHA-256 of the cookie token. The token itself is never stored. */
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
)

/** One-time links for choosing a new password. Only the SHA-256 of the token is kept. */
export const passwordResetsTable = pgTable(
  "password_resets",
  {
    id: serial().primaryKey(),
    adminId: integer("admin_id")
      .notNull()
      .references(() => adminsTable.id, {
        onDelete: "cascade",
      }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
)

/** Editable page copy. A missing key falls back to the default in the content feature. */
export const siteTextsTable = pgTable("site_texts", {
  key: text().primaryKey(),
  value: text().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})
