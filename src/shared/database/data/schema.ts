import {
  boolean,
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
  featured: boolean().notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const gamesTable = pgTable("games", {
  id: serial().primaryKey(),
  slug: text().notNull().unique(),
  year: integer().notNull(),
  name: text().notNull(),
  black: text().notNull(),
  white: text().notNull(),
  result: text().notNull(),
  setting: text().notNull(),
  hook: text().notNull(),
  moment: text().notNull(),
  legacy: text().notNull(),
  /** URL of an SGF record, rendered by goban-web when present. */
  sgfUrl: text("sgf_url"),
  /** Orders games with the same year. */
  sequence: integer().notNull().default(0),
  featured: boolean().notNull().default(false),
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

export const timelineEventsTable = pgTable(
  "timeline_events",
  {
    id: serial().primaryKey(),
    year: integer().notNull(),
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
