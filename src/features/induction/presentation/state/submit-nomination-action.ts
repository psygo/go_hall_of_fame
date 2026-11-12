"use server"

import { inductionState } from "@/config/di"

import type { NominationFormState } from "./nomination-form-state"

export async function submitNominationAction(
  _previous: NominationFormState,
  formData: FormData,
): Promise<NominationFormState> {
  return inductionState.submitNominationForm(formData)
}
