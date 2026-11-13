"use server"

import { authState } from "@/config/di"

import type { SignInFormState } from "./sign-in-form-state"

export async function signInAction(
  _previous: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  return authState.signInWithForm(formData)
}
