import { contentLoaders, gamesLoaders } from "@/config/di"
import { GameCard } from "@/shared/ui/presentation/game-card"
import { ListControls } from "@/shared/ui/presentation/list-controls"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Pagination } from "@/shared/ui/presentation/pagination"

import {
  DEFAULT_GAME_SORT,
  GAME_SORT_LABELS,
  GAME_SORTS,
  highlightMoveOf,
  sgfSourceOf,
} from "../../domain/entities/game"
import type { GamesSearchParams } from "../state/games-loaders"

type GamesScreenProps = {
  readonly searchParams: Promise<GamesSearchParams>
}

export async function GamesScreen({
  searchParams,
}: GamesScreenProps) {
  const params = await searchParams
  const [{ games, query, sort }, texts] = await Promise.all(
    [
      gamesLoaders.loadGamesPage(params),
      contentLoaders.loadPageTexts("games"),
    ],
  )

  return (
    <>
      <PageHeader
        eyebrow={texts["games.eyebrow"]}
        title={texts["games.title"]}
      >
        <ListControls
          search={{
            placeholder: "Name, player, year, place…",
            value: query,
          }}
          sort={{
            value: sort,
            options: GAME_SORTS.map((value) => ({
              value,
              label: GAME_SORT_LABELS[value],
            })),
          }}
        />
      </PageHeader>
      <div className="flex flex-col">
        {games.items.map((game) => (
          <GameCard
            key={game.slug}
            game={{
              ...game,
              sgf: sgfSourceOf(game),
              highlightMove: highlightMoveOf(game),
            }}
          />
        ))}
      </div>
      {games.total === 0 && (
        <p className="border-divider border-b px-4 py-10">
          No game matches this search.
        </p>
      )}
      <Pagination
        page={games.page}
        pageCount={games.pageCount}
        basePath="/games"
        params={{
          q: query,
          sort: sort === DEFAULT_GAME_SORT ? "" : sort,
        }}
      />
    </>
  )
}
