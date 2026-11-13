/** A piece of feedback as stored, for the admin to read. */
export type FeedbackRecord = {
  readonly id: number
  readonly email: string
  readonly description: string
  readonly isRead: boolean
  readonly createdAt: Date
}
