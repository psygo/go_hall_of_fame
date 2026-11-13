/** The game an event points to. */
export type TimelineGameReference = {
  readonly slug: string
  readonly name: string
}

/** A player an event points to. */
export type TimelinePlayerReference = {
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
  readonly games: readonly TimelineGameReference[]
  /** The players the event is about, in the admin's order. */
  readonly players: readonly TimelinePlayerReference[]
  /** Only admins see a draft. */
  readonly isDraft: boolean
}
