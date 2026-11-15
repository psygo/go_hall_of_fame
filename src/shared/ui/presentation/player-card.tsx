import Link from "next/link"

import { DraftBadge } from "./draft-badge"
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
  readonly isDraft?: boolean
}

/**
 * A player as a tile of the players list; the whole tile opens the profile. The "wide" layout puts
 * the photo beside the text (from 560px up), for a card that spans a row.
 */
export function PlayerCard({
  player,
  layout = "tile",
}: {
  readonly player: PlayerCardPlayer
  readonly layout?: "tile" | "wide"
}) {
  const isWide = layout === "wide"
  return (
    <Link
      href={`/players/${player.slug}`}
      className={`border-divider text-ink hover:bg-accent-100 hover:text-ink flex flex-col border-r border-b no-underline ${isWide ? "min-[560px]:flex-row" : ""}`}
    >
      <Portrait
        photoUrl={player.photoUrl}
        position={player.photoPosition}
        sizes="(min-width: 1200px) 230px, (min-width: 720px) 25vw, 100vw"
        className={`border-divider border-b ${isWide ? "min-[560px]:w-[40%] min-[560px]:shrink-0 min-[560px]:self-start min-[560px]:border-r" : ""}`}
      />
      <div className="flex flex-1 flex-col gap-1.5 px-4 pt-3.5 pb-5">
        <div className="flex items-center justify-end">
          <span className="flex items-center gap-1.5">
            <DraftBadge isDraft={player.isDraft} />
            <span className="tag tag-outline">
              {player.country}
            </span>
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
