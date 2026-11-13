"use server"

import { authState } from "@/config/di"

import type {
  ForgotPasswordFormState,
  ResetPasswordFormState,
} from "./password-reset-form-state"

export async function forgotPasswordAction(
  _previous: ForgotPasswordFormState,
  formData: FormData,
): Promise<ForgotPasswordFormState> {
  return authState.requestResetFromForm(formData)
}

export async function resetPasswordAction(
  token: string,
  _previous: ResetPasswordFormState,
  formData: FormData,
): Promise<ResetPasswordFormState> {
  return authState.resetPasswordFromForm(token, formData)
}
