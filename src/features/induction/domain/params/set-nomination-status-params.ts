import type { NominationStatus } from "../entities/nomination-record"

export type SetNominationStatusParams = {
  readonly id: number
  readonly status: NominationStatus
}
