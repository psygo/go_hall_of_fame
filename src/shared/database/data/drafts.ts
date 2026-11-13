import { eq, type Column, type SQL } from "drizzle-orm"

/** The condition that hides drafts: nothing to add when the viewer may see them. */
export function isVisible(
  table: { readonly isDraft: Column },
  includeDrafts: boolean,
): SQL | undefined {
  return includeDrafts
    ? undefined
    : eq(table.isDraft, false)
}
