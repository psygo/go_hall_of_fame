import type { UseCase } from "@/core/use-case"
import type { SaveResult } from "@/core/validation"

import {
  validatePlayerForm,
  type PlayerErrors,
} from "../entities/player-draft"
import type { SavePlayerParams } from "../params/save-player-params"
import type { PlayersRepository } from "../repositories/players-repository"

export class SavePlayer implements UseCase<
  SavePlayerParams,
  SaveResult<PlayerErrors>
> {
  constructor(
    private readonly players: PlayersRepository,
  ) {}

  async call({
    originalSlug,
    form,
  }: SavePlayerParams): Promise<SaveResult<PlayerErrors>> {
    const existing = await this.players.listAll()
    if (existing.status === "failure") {
      return { status: "failed", error: existing.error }
    }
    const validation = validatePlayerForm(form, {
      existing: existing.data,
      originalSlug,
    })
    if (!validation.valid) {
      return {
        status: "invalid",
        errors: validation.errors,
      }
    }
    const saved = await this.players.save(
      validation.draft,
      originalSlug,
    )
    return saved.status === "failure"
      ? { status: "failed", error: saved.error }
      : { status: "saved" }
  }
}
