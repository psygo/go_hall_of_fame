import type { ResourceLink } from "@/core/resources"
import type { Database } from "@/shared/database/data/database"
import {
  replaceResources,
  selectResources,
} from "@/shared/database/data/resources"

import { ResourceLinkModel } from "../models/resource-link-model"

export class SiteResourcesDataSource {
  constructor(private readonly database: Database) {}

  async fetchAll(): Promise<ResourceLinkModel[]> {
    const rows = await selectResources(this.database, {
      kind: "site",
    })
    return rows.map((row) =>
      ResourceLinkModel.fromRawData(row),
    )
  }

  async replaceAll(
    links: readonly ResourceLink[],
  ): Promise<void> {
    await this.database.transaction((tx) =>
      replaceResources(tx, { kind: "site" }, links),
    )
  }
}
