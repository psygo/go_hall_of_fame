import Link from "next/link"

import { gamesLoaders } from "@/config/di"
import { GoBoardPlayer } from "@/shared/go-board/presentation/go-board-player"
import { BackLink } from "@/shared/ui/presentation/back-link"
import { LabelledFact } from "@/shared/ui/presentation/labelled-fact"
import { Markdown } from "@/shared/ui/presentation/markdown"
import { NeighborBar } from "@/shared/ui/presentation/neighbor-bar"
import { displayTitleClass } from "@/shared/ui/presentation/page-header"
import { PlayerName } from "@/shared/ui/presentation/player-name"
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
        <span className="tag tag-accent self-start">
          {detail.year}
        </span>
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
        </div>
        <Markdown className="max-w-[56ch] text-xl">
          {detail.hook}
        </Markdown>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
          <div className="flex flex-col gap-1.5">
            <SectionLabel>The moment</SectionLabel>
            <Markdown className="max-w-[56ch]">
              {detail.moment}
            </Markdown>
          </div>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Why it endures</SectionLabel>
            <Markdown className="max-w-[56ch]">
              {detail.legacy}
            </Markdown>
          </div>
        </div>
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
        {detail.players.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.1em] uppercase">
              In the Hall
            </span>
            {detail.players.map((player) => (
              <Link
                key={player.slug}
                href={`/players/${player.slug}`}
                className="font-bold"
              >
                {player.name} →
              </Link>
            ))}
          </div>
        )}
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
