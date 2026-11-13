import Link from "next/link"

import { contentLoaders, gamesLoaders } from "@/config/di"
import { stripMarkdown } from "@/core/markdown"
import { GamePreviewBoard } from "@/shared/go-board/presentation/game-preview-board"
import { ListControls } from "@/shared/ui/presentation/list-controls"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PlayerName } from "@/shared/ui/presentation/player-name"

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
        {games.items.map((game) => {
          const sgf = sgfSourceOf(game)
          return (
            // The title's link stretches over the whole card; the player links and the board sit
            // above it (relative z-10), so they keep working.
            <article
              key={game.slug}
              className="border-divider hover:bg-accent-100 has-[a:focus-visible]:outline-accent relative grid grid-cols-1 border-b has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 min-[720px]:grid-cols-[160px_minmax(0,1fr)_280px]"
            >
              <div className="text-accent min-[720px]:border-divider px-4 pt-6 text-4xl leading-none font-bold min-[720px]:border-r min-[720px]:pb-6">
                {game.year}
              </div>
              <div className="flex flex-col gap-2 px-4 py-6">
                <h2 className="m-0 text-[28px] leading-[1.05] font-bold">
                  <Link
                    href={`/games/${game.slug}`}
                    className="text-ink no-underline after:absolute after:inset-0 after:content-['']"
                  >
                    {game.name}
                  </Link>
                </h2>
                <div className="text-[13px] font-bold">
                  <span className="relative z-10">
                    <PlayerName
                      name={game.black}
                      slug={game.blackPlayerSlug}
                    />
                  </span>{" "}
                  vs{" "}
                  <span className="relative z-10">
                    <PlayerName
                      name={game.white}
                      slug={game.whitePlayerSlug}
                    />
                  </span>{" "}
                  · {game.result}
                </div>
                <div className="max-w-[62ch]">
                  {stripMarkdown(game.hook)}
                </div>
              </div>
              {sgf !== null && (
                <div className="relative z-10 px-4 pb-6 min-[720px]:self-center min-[720px]:py-6 min-[720px]:pl-0">
                  <GamePreviewBoard
                    sgf={sgf}
                    targetMove={highlightMoveOf(game)}
                  />
                </div>
              )}
            </article>
          )
        })}
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
