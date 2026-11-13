/** Marks an item that only admins can see. */
export function DraftBadge({
  isDraft,
}: {
  readonly isDraft?: boolean
}) {
  if (!isDraft) return null
  return (
    <span className="tag tag-outline self-start whitespace-nowrap">
      Draft
    </span>
  )
}
