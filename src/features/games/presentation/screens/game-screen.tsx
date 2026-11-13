import { gamesLoaders } from "@/config/di"
import { GoBoardPlayer } from "@/shared/go-board/presentation/go-board-player"
import { BackLink } from "@/shared/ui/presentation/back-link"
import { DraftBadge } from "@/shared/ui/presentation/draft-badge"
import { LabelledFact } from "@/shared/ui/presentation/labelled-fact"
import { Markdown } from "@/shared/ui/presentation/markdown"
import { NeighborBar } from "@/shared/ui/presentation/neighbor-bar"
import { displayTitleClass } from "@/shared/ui/presentation/page-header"
import { PlayerName } from "@/shared/ui/presentation/player-name"
import { TagList } from "@/shared/ui/presentation/tag-list"
import { ResourceList } from "@/shared/ui/presentation/resource-list"
import { SectionLabel } from "@/shared/ui/presentation/section-label"

import {
  highlightMoveOf,
  sgfSourceOf,
} from "../../domain/entities/game"

type GameScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function GameScreen({
  params,
}: GameScreenProps) {
  const { slug } = await params
  const { detail, previous, next } =
    await gamesLoaders.loadGameProfile(slug)

  const sgf = sgfSourceOf(detail)

  return (
    <>
      <BackLink href="/games">All games</BackLink>
      <article className="border-divider flex flex-col gap-[22px] border-b px-4 pt-10 pb-12">
        <div className="flex items-center gap-2">
          <span className="tag tag-accent self-start">
            {detail.year}
          </span>
          <DraftBadge isDraft={detail.isDraft} />
        </div>
        <h1 className={displayTitleClass}>{detail.name}</h1>
        <div className="border-divider grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] border-y">
          <LabelledFact label="Black">
            <PlayerName
              name={detail.black}
              slug={detail.blackPlayerSlug}
            />
          </LabelledFact>
          <LabelledFact label="White">
            <PlayerName
              name={detail.white}
              slug={detail.whitePlayerSlug}
            />
          </LabelledFact>
          <LabelledFact label="Result">
            {detail.result}
          </LabelledFact>
          <LabelledFact label="Setting">
            {detail.setting}
          </LabelledFact>
          {sgf !== null && (
            <div className="flex items-center py-3">
              <a
                href={sgf}
                download={`${detail.slug}.sgf`}
                className="btn btn-secondary"
              >
                Download SGF
              </a>
            </div>
          )}
        </div>
        <Markdown className="max-w-[56ch] text-lg">
          {detail.description}
        </Markdown>
        <TagList tags={detail.tags} searchPath="/games" />
        {sgf !== null && (
          <div className="flex flex-col gap-1.5">
            <SectionLabel>The record</SectionLabel>
            <GoBoardPlayer
              sgf={sgf}
              highlightMove={highlightMoveOf(detail)}
            />
          </div>
        )}
        <ResourceList resources={detail.resources} />
      </article>
      <NeighborBar
        previous={{
          href: `/games/${previous.slug}`,
          name: previous.name,
        }}
        next={{
          href: `/games/${next.slug}`,
          name: next.name,
        }}
      />
    </>
  )
}
