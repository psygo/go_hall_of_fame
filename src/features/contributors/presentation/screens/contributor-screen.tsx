import { contributorsLoaders } from "@/config/di"
import { BackLink } from "@/shared/ui/presentation/back-link"
import { DraftBadge } from "@/shared/ui/presentation/draft-badge"
import { LabelledFact } from "@/shared/ui/presentation/labelled-fact"
import { Markdown } from "@/shared/ui/presentation/markdown"
import { displayTitleClass } from "@/shared/ui/presentation/page-header"
import { Portrait } from "@/shared/ui/presentation/portrait"

import { CONTRIBUTOR_KIND_LABELS } from "../../domain/entities/contributor"

type ContributorScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function ContributorScreen({
  params,
}: ContributorScreenProps) {
  const { slug } = await params
  const contributor =
    await contributorsLoaders.loadContributor(slug)

  return (
    <>
      <BackLink href="/contributors">
        All contributors
      </BackLink>
      <section className="border-divider grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] border-b">
        <div className="border-divider border-r">
          <Portrait
            photoUrl={contributor.photoUrl}
            position={contributor.photoPosition}
            fit={
              contributor.kind === "person"
                ? "cover"
                : "contain"
            }
            sizes="(min-width: 1200px) 600px, 100vw"
          />
        </div>
        <div className="flex flex-col gap-5 px-4 pt-8 pb-10">
          <div className="flex flex-wrap gap-2">
            <span className="tag tag-outline">
              {CONTRIBUTOR_KIND_LABELS[contributor.kind]}
            </span>
          </div>
          <h1 className={displayTitleClass}>
            {contributor.name}
          </h1>
          <DraftBadge isDraft={contributor.isDraft} />
          <div className="border-divider grid grid-cols-2 border-y">
            <LabelledFact label="Born or founded">
              {contributor.birthYear}
            </LabelledFact>
            <LabelledFact label="Contribution">
              {contributor.role}
            </LabelledFact>
            {contributor.period !== "" && (
              <LabelledFact label="Period">
                {contributor.period}
              </LabelledFact>
            )}
          </div>
          <Markdown className="max-w-[56ch] text-lg">
            {contributor.bio}
          </Markdown>
        </div>
      </section>
    </>
  )
}
