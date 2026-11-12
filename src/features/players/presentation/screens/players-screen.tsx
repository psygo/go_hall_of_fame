import Link from "next/link"

import { playersLoaders } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Portrait } from "@/shared/ui/presentation/portrait"

type PlayersScreenProps = {
  readonly searchParams: Promise<{
    readonly country?: string | readonly string[]
  }>
}

export async function PlayersScreen({
  searchParams,
}: PlayersScreenProps) {
  const { country: countryParam } = await searchParams
  const { players, country, countries } =
    await playersLoaders.loadPlayersPage(countryParam)

  const filters = [
    {
      label: "All",
      href: "/players",
      isActive: country === null,
    },
    ...countries.map((name) => ({
      label: name,
      href: `/players?country=${name}`,
      isActive: country === name,
    })),
  ]

  return (
    <>
      <PageHeader
        eyebrow="Inductees"
        title="Legendary players"
      >
        <div className="mt-7 flex flex-wrap gap-2">
          {filters.map(({ label, href, isActive }) => (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "true" : undefined}
              className={`btn ${isActive ? "btn-primary" : "btn-secondary"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </PageHeader>
      <section className="grid grid-cols-[repeat(auto-fill,minmax(min(230px,100%),1fr))]">
        {players.map((player) => (
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
    </>
  )
}
