export type ForgotPasswordFormState =
  | { readonly status: "idle" }
  | { readonly status: "sent" }
  | {
      readonly status: "rejected"
      readonly message: string
      readonly email: string
    }

export type ResetPasswordFormState =
  | { readonly status: "idle" }
  | {
      readonly status: "rejected"
      readonly message: string
    }

export const idleForgotPasswordForm: ForgotPasswordFormState =
  {
    status: "idle",
  }

export const idleResetPasswordForm: ResetPasswordFormState =
  {
    status: "idle",
  }
