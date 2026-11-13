import type { DataState } from "@/core/data-state"

export type ResetEmail = {
  readonly to: string
  readonly name: string
  /** The full link, with its token. */
  readonly link: string
  readonly validForMinutes: number
}

export interface ResetMailer {
  send(email: ResetEmail): Promise<DataState<void>>
}
