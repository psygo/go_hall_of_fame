import type { Admin } from "./admin"

export type SignInResult =
  | {
      readonly status: "signed-in"
      readonly admin: Admin
      readonly token: string
      readonly expiresAt: Date
    }
  /** Unknown email or wrong password; deliberately indistinguishable. */
  | { readonly status: "invalid" }
  | { readonly status: "locked"; readonly until: Date }
  | { readonly status: "failed"; readonly error: Error }
