import Link from "next/link"

import { contentLoaders, playersLoaders } from "@/config/di"
import { ListControls } from "@/shared/ui/presentation/list-controls"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Portrait } from "@/shared/ui/presentation/portrait"

import {
  DEFAULT_PLAYER_SORT,
  PLAYER_SORT_LABELS,
  PLAYER_SORTS,
} from "../../domain/entities/player"
import type { PlayersSearchParams } from "../state/players-loaders"

type PlayersScreenProps = {
  readonly searchParams: Promise<PlayersSearchParams>
}

export async function PlayersScreen({
  searchParams,
}: PlayersScreenProps) {
  const params = await searchParams
  const [
    { players, country, countries, query, sort },
    texts,
  ] = await Promise.all([
    playersLoaders.loadPlayersPage(params),
    contentLoaders.loadPageTexts("players"),
  ])

  return (
    <>
      <PageHeader
        eyebrow={texts["players.eyebrow"]}
        title={texts["players.title"]}
      >
        <ListControls
          search={{
            placeholder: "Name, country, distinction…",
            value: query,
          }}
          filters={[
            {
              name: "country",
              label: "Country",
              value: country ?? "",
              options: [
                { value: "", label: "All" },
                ...countries.map((name) => ({
                  value: name,
                  label: name,
                })),
              ],
            },
          ]}
          sort={{
            value: sort,
            options: PLAYER_SORTS.map((value) => ({
              value,
              label: PLAYER_SORT_LABELS[value],
            })),
          }}
        />
      </PageHeader>
      <section className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))]">
        {players.items.map((player) => (
          <Link
            key={player.slug}
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
            </div>
          </Link>
        ))}
      </section>
      {players.total === 0 && (
        <p className="border-divider border-b px-4 py-10">
          No player matches this search.
        </p>
      )}
      <Pagination
        page={players.page}
        pageCount={players.pageCount}
        basePath="/players"
        params={{
          q: query,
          country: country ?? "",
          sort: sort === DEFAULT_PLAYER_SORT ? "" : sort,
        }}
      />
    </>
  )
}
