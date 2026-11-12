import Link from "next/link"

import { gamesLoaders } from "@/config/di"
import { GoBoardPlayer } from "@/shared/go-board/presentation/go-board-player"
import { BackLink } from "@/shared/ui/presentation/back-link"
import { LabelledFact } from "@/shared/ui/presentation/labelled-fact"
import { NeighborBar } from "@/shared/ui/presentation/neighbor-bar"
import { displayTitleClass } from "@/shared/ui/presentation/page-header"
import { SectionLabel } from "@/shared/ui/presentation/section-label"

type GameScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function GameScreen({
  params,
}: GameScreenProps) {
  const { slug } = await params
  const { detail, previous, next } =
    await gamesLoaders.loadGameProfile(slug)

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
            {detail.black}
          </LabelledFact>
          <LabelledFact label="White">
            {detail.white}
          </LabelledFact>
          <LabelledFact label="Result">
            {detail.result}
          </LabelledFact>
          <LabelledFact label="Setting">
            {detail.setting}
          </LabelledFact>
        </div>
        <p className="max-w-[56ch] text-xl">
          {detail.hook}
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
          <div className="flex flex-col gap-1.5">
            <SectionLabel>The moment</SectionLabel>
            <p className="max-w-[56ch]">{detail.moment}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Why it endures</SectionLabel>
            <p className="max-w-[56ch]">{detail.legacy}</p>
          </div>
        </div>
        {detail.sgfUrl !== null && (
          <div className="flex flex-col gap-1.5">
            <SectionLabel>The record</SectionLabel>
            <GoBoardPlayer sgf={detail.sgfUrl} />
          </div>
        )}
        {detail.players.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase">
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
