import Link from "next/link"
import Image from "next/image"

import { contentLoaders, homeLoaders } from "@/config/di"
import { stripMarkdown } from "@/core/markdown"
import { fillPlaceholders } from "@/core/placeholders"
import { HeroBoard } from "@/shared/go-board/presentation/hero-board"
import { Portrait } from "@/shared/ui/presentation/portrait"

const cellClass =
  "flex flex-col gap-3 border-r border-b border-divider px-5 py-8 text-ink no-underline hover:bg-accent-100 hover:text-ink"

export async function HomeScreen() {
  const [summary, texts] = await Promise.all([
    homeLoaders.loadHome(),
    contentLoaders.loadPageTexts("home"),
  ])
  const { featuredGame, featuredPlayer } = summary

  const cells = [
    {
      href: "/players",
      figure: String(summary.playerCount),
      title: "Legendary players",
      text: texts["home.playersCardText"],
    },
    {
      href: "/games",
      figure: String(summary.gameCount),
      title: "Legendary games",
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
      <section className="border-divider relative overflow-hidden border-b">
        <div
          aria-hidden
          className="text-accent font-seal pointer-events-none absolute -top-[30px] right-4 text-[clamp(200px,32vw,440px)] leading-none font-extrabold opacity-10"
        >
          碁
        </div>
        <div
          aria-hidden
          className="font-seal border-divider absolute top-[72px] left-7 hidden border-r pr-3.5 text-[22px] font-semibold tracking-[0.4em] [writing-mode:vertical-rl] min-[720px]:block"
        >
          囲碁殿堂
        </div>
        <div className="relative flex flex-col items-center gap-6 px-4 pt-10 pb-8 text-center min-[720px]:px-6 min-[720px]:pt-[72px] min-[720px]:pb-10">
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.12em] uppercase">
            <Image
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
              unoptimized
              className="size-10"
            />
            圍棋 · 囲碁 · 바둑
          </div>
          <h1 className="max-w-[13ch] text-[52px] leading-[0.92] text-balance min-[720px]:text-[clamp(48px,7vw,96px)]">
            {texts["home.title"]}
          </h1>
          <p className="max-w-[44ch]">
            {fillPlaceholders(texts["home.intro"], {
              playerCount: summary.playerCount,
              gameCount: summary.gameCount,
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/players"
              className="btn btn-primary"
            >
              Enter the players
            </Link>
            <Link
              href="/games"
              className="btn btn-secondary"
            >
              Legendary games
            </Link>
          </div>
        </div>
        <div className="border-divider flex justify-center border-t px-4 py-6">
          <HeroBoard />
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

      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-8 px-4 py-12">
        {featuredGame && (
          <div className="flex flex-col gap-3">
            <span className="tag tag-accent self-start">
              Featured game
            </span>
            <h2 className="text-4xl leading-none">
              {featuredGame.name}
            </h2>
            <div className="text-sm">
              {featuredGame.year} · {featuredGame.black} vs{" "}
              {featuredGame.white}
            </div>
            <p className="max-w-[50ch]">
              {stripMarkdown(featuredGame.hook)}
            </p>
            <Link href={`/games/${featuredGame.slug}`}>
              Read the game →
            </Link>
          </div>
        )}
        {featuredPlayer && (
          <div className="grid grid-cols-[120px_1fr] items-start gap-4">
            <Portrait
              photoUrl={featuredPlayer.photoUrl}
              position={featuredPlayer.photoPosition}
              sizes="120px"
            />
            <div className="flex flex-col gap-3">
              <span className="tag tag-outline self-start">
                Featured player
              </span>
              <h2 className="text-[32px] leading-none">
                {featuredPlayer.name}
              </h2>
              <div className="text-sm">
                {featuredPlayer.nativeName} ·{" "}
                {featuredPlayer.years}
              </div>
              <Link
                href={`/players/${featuredPlayer.slug}`}
              >
                Open the profile →
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
