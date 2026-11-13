import { succeed, type DataState } from "@/core/data-state"
import type { UseCase } from "@/core/use-case"

import {
  resolvePageTexts,
  type PageTexts,
} from "../entities/page-text"
import type { PageParams } from "../params/page-params"
import type { SiteTextsRepository } from "../repositories/site-texts-repository"

export class GetPageTexts implements UseCase<
  PageParams,
  DataState<PageTexts>
> {
  constructor(
    private readonly siteTexts: SiteTextsRepository,
  ) {}

  async call({
    page,
  }: PageParams): Promise<DataState<PageTexts>> {
    const overrides = await this.siteTexts.listOverrides()
    if (overrides.status === "failure") return overrides
    return succeed(resolvePageTexts(page, overrides.data))
  }
}
