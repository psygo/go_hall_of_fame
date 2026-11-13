import Link from "next/link"

import { Portrait } from "./portrait"
import { TagList } from "./tag-list"

export type PlayerCardPlayer = {
  readonly slug: string
  readonly inductionNumber: number
  readonly name: string
  readonly nativeName: string
  readonly country: string
  readonly distinction: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  readonly tags: readonly string[]
}

/** A player as a tile of the players list; the whole tile opens the profile. */
export function PlayerCard({
  player,
}: {
  readonly player: PlayerCardPlayer
}) {
  return (
    <Link
      href={`/players/${player.slug}`}
      className="border-divider text-ink hover:bg-accent-100 hover:text-ink flex flex-col border-r border-b no-underline"
    >
      <Portrait
        photoUrl={player.photoUrl}
        position={player.photoPosition}
        sizes="(min-width: 1200px) 230px, (min-width: 720px) 25vw, 100vw"
        className="border-divider border-b"
      />
      <div className="flex flex-1 flex-col gap-1.5 px-4 pt-3.5 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-accent-700 text-xs font-bold">
            No.{" "}
            {String(player.inductionNumber).padStart(
              2,
              "0",
            )}
          </span>
          <span className="tag tag-outline">
            {player.country}
          </span>
        </div>
        <div className="mt-1.5 text-2xl leading-[1.05] font-bold">
          {player.name}
        </div>
        <div className="text-[17px]">
          {player.nativeName}
        </div>
        <div className="mt-auto pt-2 text-sm font-bold">
          {player.distinction}
        </div>
        <TagList tags={player.tags} />
      </div>
    </Link>
  )
}
