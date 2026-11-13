import Link from "next/link"

import { contributorsLoaders } from "@/config/di"
import { DraftBadge } from "@/shared/ui/presentation/draft-badge"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Portrait } from "@/shared/ui/presentation/portrait"

import { CONTRIBUTOR_KIND_LABELS } from "../../domain/entities/contributor"

export async function ContributorsScreen() {
  const contributors =
    await contributorsLoaders.loadContributors()

  return (
    <>
      <PageHeader
        eyebrow="Beyond the board"
        title="Game Contributors"
      >
        <p className="mt-4 max-w-[56ch] text-lg">
          People and organizations that advanced the game of
          Go without being legendary players.
        </p>
      </PageHeader>
      {contributors.length === 0 ? (
        <p className="border-divider border-b px-4 py-8">
          No contributors yet.
        </p>
      ) : (
        <ul className="border-divider m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))] border-t p-0">
          {contributors.map((contributor) => (
            <li key={contributor.slug} className="contents">
              <Link
                href={`/contributors/${contributor.slug}`}
                className="border-divider text-ink hover:bg-accent-100 hover:text-ink flex flex-col border-r border-b no-underline"
              >
                <Portrait
                  photoUrl={contributor.photoUrl}
                  position={contributor.photoPosition}
                  sizes="(min-width: 1200px) 300px, (min-width: 720px) 33vw, 100vw"
                  className="border-divider border-b"
                />
                <div className="flex flex-1 flex-col gap-1.5 px-4 pt-3.5 pb-5">
                  <div className="flex items-center gap-1.5">
                    <span className="tag tag-outline">
                      {
                        CONTRIBUTOR_KIND_LABELS[
                          contributor.kind
                        ]
                      }
                    </span>
                    <DraftBadge
                      isDraft={contributor.isDraft}
                    />
                  </div>
                  <div className="mt-1.5 text-2xl leading-[1.05] font-bold">
                    {contributor.name}
                  </div>
                  <div className="mt-auto pt-2 text-sm font-bold">
                    {contributor.role}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
