/** The game an event points to. */
export type TimelineGameReference = {
  readonly slug: string
  readonly name: string
}

export type TimelineEvent = {
  readonly id: number
  readonly year: number
  readonly title: string
  readonly text: string
  readonly game: TimelineGameReference | null
}
