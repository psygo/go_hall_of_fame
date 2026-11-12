import type {
  NominationDraft,
  NominationErrors,
} from "../../domain/entities/nomination"

export type NominationFormValues = NominationDraft

export type NominationFormState =
  | { readonly status: "idle" }
  | {
      readonly status: "invalid"
      readonly errors: NominationErrors
      readonly values: NominationFormValues
    }
  | {
      readonly status: "failed"
      readonly values: NominationFormValues
    }
  | {
      readonly status: "accepted"
      readonly name: string
      readonly email: string
    }

export const idleNominationForm: NominationFormState = {
  status: "idle",
}
