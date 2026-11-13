/** The game an event points to. */
export type TimelineGameReference = {
  readonly slug: string
  readonly name: string
}

export type TimelineEvent = {
  readonly id: number
  /** As written: old events have no exact date ("c. 1670"). */
  readonly year: string
  readonly title: string
  readonly text: string
  readonly game: TimelineGameReference | null
  /** Only admins see a draft. */
  readonly isDraft: boolean
}
