/** The state of an admin form after a submission that did not save (a save redirects away). */
export type AdminFormState<Values, Errors> =
  | { readonly status: "idle" }
  | {
      readonly status: "invalid"
      readonly errors: Errors
      readonly values: Values
    }
  | {
      readonly status: "failed"
      readonly message: string
      readonly values: Values
    }

export const idleAdminForm = { status: "idle" } as const
