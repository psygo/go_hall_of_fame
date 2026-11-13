import Link from "next/link"

import { playersLoaders } from "@/config/di"
import { BackLink } from "@/shared/ui/presentation/back-link"
import { LabelledFact } from "@/shared/ui/presentation/labelled-fact"
import { NeighborBar } from "@/shared/ui/presentation/neighbor-bar"
import { displayTitleClass } from "@/shared/ui/presentation/page-header"
import { Portrait } from "@/shared/ui/presentation/portrait"
import { ResourceList } from "@/shared/ui/presentation/resource-list"
import { SectionLabel } from "@/shared/ui/presentation/section-label"

type PlayerScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function PlayerScreen({
  params,
}: PlayerScreenProps) {
  const { slug } = await params
  const { detail, previous, next } =
    await playersLoaders.loadPlayerProfile(slug)

  return (
    <>
      <BackLink href="/players">All players</BackLink>
      <section className="border-divider grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] border-b">
        <div className="border-divider border-r">
          <Portrait
            photoUrl={detail.photoUrl}
            position={detail.photoPosition}
            sizes="(min-width: 1200px) 600px, 100vw"
          />
          {detail.photoUrl === null && (
            <div className="border-divider border-t px-4 py-2 text-[11px]">
              Placeholder photograph
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5 px-4 pt-8 pb-10">
          <div className="flex flex-wrap gap-2">
            <span className="tag tag-accent">
              No.{" "}
              {String(detail.inductionNumber).padStart(
                2,
                "0",
              )}
            </span>
            <span className="tag tag-outline">
              {detail.country}
            </span>
          </div>
          <h1 className={displayTitleClass}>
            {detail.name}
          </h1>
          <div className="text-[28px]">
            {detail.nativeName}
          </div>
          <div className="border-divider grid grid-cols-2 border-y">
            <LabelledFact label="Years">
              {detail.years}
            </LabelledFact>
            <LabelledFact label="Distinction">
              {detail.distinction}
            </LabelledFact>
          </div>
          <p className="max-w-[56ch] text-lg">
            {detail.bio}
          </p>
          <ResourceList resources={detail.resources} />
          {detail.games.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <SectionLabel>Legendary games</SectionLabel>
              {detail.games.map((game) => (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="text-lg font-bold"
                >
                  {game.year} · {game.name} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <NeighborBar
        previous={{
          href: `/players/${previous.slug}`,
          name: previous.name,
        }}
        next={{
          href: `/players/${next.slug}`,
          name: next.name,
        }}
      />
    </>
  )
}
