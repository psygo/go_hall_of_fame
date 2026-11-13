import type { CriteriaOrder } from "../entities/criterion"

export type PageCriteriaParams = {
  readonly order: CriteriaOrder
  /** 1-based; clamped into the pages that exist. */
  readonly page: number
}
