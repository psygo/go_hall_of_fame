export type SignInFormState =
  | { readonly status: "idle" }
  | {
      readonly status: "rejected"
      readonly message: string
      readonly email: string
    }

export const idleSignInForm: SignInFormState = {
  status: "idle",
}
