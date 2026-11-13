import type { DataState } from "@/core/data-state"
import type { ResourceLink } from "@/core/resources"

export interface SiteResourcesRepository {
  /** The links of the Resources page, in the order the admin arranged them. */
  listAll(): Promise<DataState<readonly ResourceLink[]>>
  /** Replaces every link of the Resources page. */
  replaceAll(
    links: readonly ResourceLink[],
  ): Promise<DataState<void>>
}
