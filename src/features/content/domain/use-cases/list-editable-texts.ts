import { succeed, type DataState } from "@/core/data-state"
import type { NoParams, UseCase } from "@/core/use-case"

import {
  toEditableTexts,
  type EditableText,
} from "../entities/page-text"
import type { SiteTextsRepository } from "../repositories/site-texts-repository"

export class ListEditableTexts implements UseCase<
  NoParams,
  DataState<readonly EditableText[]>
> {
  constructor(
    private readonly siteTexts: SiteTextsRepository,
  ) {}

  async call(): Promise<
    DataState<readonly EditableText[]>
  > {
    const overrides = await this.siteTexts.listOverrides()
    if (overrides.status === "failure") return overrides
    return succeed(toEditableTexts(overrides.data))
  }
}
