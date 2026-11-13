import Link from "next/link"

/** A player's name, linking to their page when they are in the Hall. */
export function PlayerName({
  name,
  slug,
}: {
  readonly name: string
  readonly slug: string | null
}) {
  if (slug === null) return <>{name}</>
  return (
    <Link href={`/players/${slug}`} className="underline">
      {name}
    </Link>
  )
}
