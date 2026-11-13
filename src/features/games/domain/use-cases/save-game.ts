import type { UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"

import {
  validateGameForm,
  type GameErrors,
} from "../entities/game-draft"
import type { SaveGameParams } from "../params/save-game-params"
import type { GamesRepository } from "../repositories/games-repository"

export class SaveGame implements UseCase<
  SaveGameParams,
  SaveResult<GameErrors>
> {
  constructor(private readonly games: GamesRepository) {}

  async call({
    originalSlug,
    form,
  }: SaveGameParams): Promise<SaveResult<GameErrors>> {
    const [existing, playerOptions] = await Promise.all([
      this.games.listAll(),
      this.games.listPlayerOptions(),
    ])
    if (existing.status === "failure") {
      return { status: "failed", error: existing.error }
    }
    if (playerOptions.status === "failure") {
      return {
        status: "failed",
        error: playerOptions.error,
      }
    }
    const validation = validateGameForm(form, {
      existing: existing.data,
      originalSlug,
      playerOptions: playerOptions.data,
    })
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const saved = await this.games.save(
      validation.draft,
      originalSlug,
    )
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "saved" }
  }
}
