export type Criterion = {
  readonly id: number
  readonly position: number
  readonly title: string
  readonly text: string
}

export const CRITERIA_PAGE_SIZE = 4

export const CRITERIA_ORDERS = ["first", "last"] as const

export type CriteriaOrder = (typeof CRITERIA_ORDERS)[number]

export const CRITERIA_ORDER_LABELS: Readonly<
  Record<CriteriaOrder, string>
> = {
  first: "First to last",
  last: "Last to first",
}

/** The list arrives ordered by position. */
export function orderCriteria(
  criteria: readonly Criterion[],
  order: CriteriaOrder,
): readonly Criterion[] {
  return order === "first"
    ? criteria
    : [...criteria].reverse()
}
