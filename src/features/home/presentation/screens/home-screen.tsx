import Link from "next/link"
import Image from "next/image"

import { contentLoaders, homeLoaders } from "@/config/di"
import { fillPlaceholders } from "@/core/placeholders"
import { getMessages } from "@/shared/i18n/presentation/server-locale"
import { MESSAGES } from "@/shared/i18n/presentation/messages"
import { GameCard } from "@/shared/ui/presentation/game-card"
import { PlayerCard } from "@/shared/ui/presentation/player-card"

const cellClass =
  "flex flex-col gap-3 border-r border-b border-divider px-5 py-8 text-ink no-underline hover:bg-accent-100 hover:text-ink"

export async function HomeScreen() {
  const [summary, texts] = await Promise.all([
    homeLoaders.loadHome(),
    contentLoaders.loadPageTexts("home"),
  ])
  const messages = await getMessages()
  // Texts the admin has not changed follow the visitor's language; edited ones are shown as written.
  const title =
    texts["home.title"] === MESSAGES.en.homeTitle
      ? messages.homeTitle
      : texts["home.title"]
  const intro =
    texts["home.intro"] === MESSAGES.en.homeIntro
      ? messages.homeIntro
      : texts["home.intro"]
  const { spotlightGame, spotlightPlayers } = summary

  const cells = [
    {
      href: "/players",
      figure: String(summary.playerCount),
      title: "Legendary Players",
      text: texts["home.playersCardText"],
    },
    {
      href: "/games",
      figure: String(summary.gameCount),
      title: "Legendary Games",
      text: texts["home.gamesCardText"],
    },
    {
      href: "/timeline",
      figure: String(summary.centuries),
      title: "Centuries of Go",
      text: texts["home.timelineCardText"],
    },
  ]

  return (
    <>
      <div
        aria-hidden
        className="text-accent font-seal pointer-events-none absolute -top-[30px] right-4 text-[clamp(200px,32vw,440px)] leading-none font-extrabold opacity-10"
      >
        碁
      </div>
      <section className="border-divider relative overflow-hidden border-b">
        {/* <div
          aria-hidden
          className="font-seal border-divider absolute top-[72px] left-7 hidden border-r pr-3.5 text-[22px] font-semibold tracking-[0.4em] [writing-mode:vertical-rl] min-[720px]:block"
        >
          囲碁殿堂
        </div> */}
        <div className="relative flex flex-col items-center gap-6 px-4 pt-10 pb-8 text-center min-[720px]:px-6 min-[720px]:pt-[72px] min-[720px]:pb-10">
          <Image
            src="/logo.svg"
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-10"
          />
          <div className="flex items-center gap-4 font-mono text-[28px] tracking-[0.12em] uppercase">
            <span>圍棋·囲碁·바둑</span>
          </div>
          <h1 className="max-w-[13ch] text-[52px] leading-[0.92] text-balance min-[720px]:text-[clamp(48px,7vw,96px)]">
            {title}
          </h1>
          <p className="max-w-[44ch]">
            {fillPlaceholders(intro, {
              playerCount: summary.playerCount,
              gameCount: summary.gameCount,
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/players"
              className="btn btn-primary"
            >
              Legendary Players
            </Link>
            <Link href="/games" className="btn btn-primary">
              Legendary Games
            </Link>
            <Link
              href="/timeline"
              className="btn btn-primary"
            >
              {messages.timeline}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))]">
        {cells.map(({ href, figure, title, text }) => (
          <Link
            key={href}
            href={href}
            className={cellClass}
          >
            <div className="text-accent text-6xl leading-none font-bold">
              {figure}
            </div>
            <div className="text-xl font-bold">{title}</div>
            <div className="max-w-[34ch] text-sm">
              {text}
            </div>
            <div className="text-[13px] font-bold">
              Open →
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 min-[1000px]:grid-cols-[minmax(0,5fr)_minmax(0,2fr)]">
        {spotlightGame && (
          <section aria-labelledby="home-game-heading">
            <h2
              id="home-game-heading"
              className="border-divider border-b px-4 py-3 font-mono text-xs tracking-[0.12em] uppercase"
            >
              A legendary game
            </h2>
            <GameCard game={spotlightGame} />
          </section>
        )}

        {spotlightPlayers.length > 0 && (
          <section aria-labelledby="home-player-heading">
            <h2
              id="home-player-heading"
              className="border-divider border-b px-4 py-3 font-mono text-xs tracking-[0.12em] uppercase"
            >
              <span className="min-[1000px]:hidden">
                {spotlightPlayers.length === 1
                  ? "A legendary player"
                  : "Legendary players"}
              </span>
              <span className="max-[999px]:hidden">
                A legendary player
              </span>
            </h2>
            {/* Beside the game the column is narrow and shows one player; when the layout stacks, the others fill the row. */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))]">
              {spotlightPlayers.map((player, index) => (
                <div
                  key={player.slug}
                  className={`contents ${index === 0 ? "" : "[&>*]:min-[1000px]:hidden"}`}
                >
                  <PlayerCard player={player} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
