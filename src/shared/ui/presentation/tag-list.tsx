import Link from "next/link"

/**
 * Small labels. With `searchPath` each tag links to that list searched for the tag; without it
 * (inside a card that is already a link) they are plain text.
 */
export function TagList({
  tags,
  searchPath,
}: {
  readonly tags: readonly string[]
  readonly searchPath?: string
}) {
  if (tags.length === 0) return null
  return (
    <ul
      className="m-0 flex list-none flex-wrap gap-1.5 p-0"
      aria-label="Tags"
    >
      {tags.map((tag) => (
        <li key={tag}>
          {searchPath === undefined ? (
            <span className={TAG_CLASS}>{tag}</span>
          ) : (
            <Link
              href={`${searchPath}?q=${encodeURIComponent(tag)}`}
              className={`${TAG_CLASS} hover:text-accent hover:border-accent relative z-10 no-underline`}
            >
              {tag}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

const TAG_CLASS =
  "border-divider text-ink inline-block border px-2 py-0.5 font-mono text-xs tracking-[0.08em] uppercase"
