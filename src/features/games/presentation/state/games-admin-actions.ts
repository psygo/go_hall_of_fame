"use server"

import { gamesAdminState } from "@/config/di"

import type { GameFormState } from "./games-admin-state"

export async function saveGameAction(
  slugParam: string,
  _previous: GameFormState,
  formData: FormData,
): Promise<GameFormState> {
  return gamesAdminState.saveFromForm(slugParam, formData)
}

export async function deleteGameAction(
  slug: string,
): Promise<void> {
  return gamesAdminState.deleteBySlug(slug)
}
