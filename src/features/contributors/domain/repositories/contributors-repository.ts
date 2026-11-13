import type { DataState } from "@/core/data-state"

import type { Contributor } from "../entities/contributor"
import type { ContributorDraft } from "../entities/contributor-draft"

export interface ContributorsRepository {
  listAll(): Promise<DataState<readonly Contributor[]>>
  findBySlug(
    slug: string,
  ): Promise<DataState<Contributor | null>>
  /** Updates the contributor with `originalSlug`, or inserts a new one when it is null. */
  save(
    draft: ContributorDraft,
    originalSlug: string | null,
  ): Promise<DataState<void>>
  deleteBySlug(slug: string): Promise<DataState<void>>
}
