import Link from "next/link"

import { contentLoaders, gamesLoaders } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

export async function GamesScreen() {
  const [games, texts] = await Promise.all([
    gamesLoaders.loadGames(),
    contentLoaders.loadPageTexts("games"),
  ])

  return (
    <>
      <PageHeader
        eyebrow={texts["games.eyebrow"]}
        title={texts["games.title"]}
      />
      <div className="flex flex-col">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className="border-divider text-ink hover:bg-accent-100 hover:text-ink grid grid-cols-1 border-b no-underline min-[720px]:grid-cols-[160px_1fr]"
          >
            <div className="text-accent min-[720px]:border-divider px-4 pt-6 text-4xl leading-none font-bold min-[720px]:border-r min-[720px]:pb-6">
              {game.year}
            </div>
            <div className="flex flex-col gap-2 px-4 py-6">
              <div className="text-[28px] leading-[1.05] font-bold">
                {game.name}
              </div>
              <div className="text-[13px] font-bold">
                {game.black} vs {game.white} · {game.result}
              </div>
              <div className="max-w-[62ch]">
                {game.hook}
              </div>
              <div className="text-[13px] font-bold">
                Read the game →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
