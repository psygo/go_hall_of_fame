import { contentLoaders, playersLoaders } from "@/config/di"
import { ListControls } from "@/shared/ui/presentation/list-controls"
import { PlayerCard } from "@/shared/ui/presentation/player-card"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PageHeader } from "@/shared/ui/presentation/page-header"

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
            placeholder: "Name, country, distinction, tag…",
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
          <PlayerCard key={player.slug} player={player} />
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
