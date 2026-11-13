"use server"

import { playersAdminState } from "@/config/di"

import type { PlayerFormState } from "./players-admin-state"

export async function savePlayerAction(
  slugParam: string,
  _previous: PlayerFormState,
  formData: FormData,
): Promise<PlayerFormState> {
  return playersAdminState.saveFromForm(slugParam, formData)
}

export async function deletePlayerAction(
  slug: string,
): Promise<void> {
  return playersAdminState.deleteBySlug(slug)
}
