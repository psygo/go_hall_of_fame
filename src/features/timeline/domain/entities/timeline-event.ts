/** The game an event points to. */
export type TimelineGameReference = {
  readonly slug: string
  readonly name: string
}

/** A game an event is about, with what its small board needs. */
export type TimelineLinkedGame = TimelineGameReference & {
  /** Where the board loads the record from, or null for a game without one. */
  readonly sgf: string | null
  /** The move the board rests on, or null for the default. */
  readonly highlightMove: number | null
}

/** A player an event points to. */
export type TimelinePlayerReference = {
  readonly slug: string
  readonly name: string
}

/** A player an event is about, with the photo shown beside the name. */
export type TimelineLinkedPlayer =
  TimelinePlayerReference & {
    readonly photoUrl: string | null
    readonly photoPosition: string
  }

/** A contributor an event is about, with the picture shown beside the name. */
export type TimelineLinkedContributor =
  TimelineContributorReference & {
    /** A person's photo is cropped; an organization's or entity's logo is shown whole. */
    readonly kind: string
    readonly photoUrl: string | null
    readonly photoPosition: string
  }

/** A contributor an event points to. */
export type TimelineContributorReference = {
  readonly slug: string
  readonly name: string
}

export type TimelineEvent = {
  readonly id: number
  /** As written: old events have no exact date ("c. 1670"). */
  readonly year: string
  readonly title: string
  readonly text: string
  /** The games the event is about, in the admin's order. */
  readonly games: readonly TimelineLinkedGame[]
  /** The players the event is about, in the admin's order. */
  readonly players: readonly TimelineLinkedPlayer[]
  /** The contributors the event is about, in the admin's order. */
  readonly contributors: readonly TimelineLinkedContributor[]
  /** Whether the linked games' boards show the game's title. */
  readonly showGameTitles: boolean
  /** Only admins see a draft. */
  readonly isDraft: boolean
}
