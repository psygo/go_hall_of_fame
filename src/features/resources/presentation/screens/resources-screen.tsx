import {
  contentLoaders,
  resourcesLoaders,
} from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"
import { Pagination } from "@/shared/ui/presentation/pagination"

import type { ResourcesSearchParams } from "../state/resources-loaders"

type ResourcesScreenProps = {
  readonly searchParams: Promise<ResourcesSearchParams>
}

export async function ResourcesScreen({
  searchParams,
}: ResourcesScreenProps) {
  const params = await searchParams
  const [resources, texts] = await Promise.all([
    resourcesLoaders.loadResourcesPage(params),
    contentLoaders.loadPageTexts("resources"),
  ])

  return (
    <>
      <PageHeader
        eyebrow={texts["resources.eyebrow"]}
        title={texts["resources.title"]}
      >
        <p className="mt-4 max-w-[56ch] text-lg">
          {texts["resources.description"]}
        </p>
      </PageHeader>
      <section className="border-divider border-b px-4 py-8">
        {resources.total === 0 ? (
          <p>No resources yet.</p>
        ) : (
          <ul className="m-0 flex max-w-[70ch] list-disc flex-col gap-3 pl-5 text-lg">
            {resources.items.map((resource, index) => (
              <li key={`${index}-${resource.url}`}>
                <a
                  href={resource.url}
                  className="font-bold"
                  {...(resource.url.startsWith("https://")
                    ? {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {})}
                >
                  {resource.title || resource.url}
                </a>
                {resource.description !== null && (
                  <span> — {resource.description}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <Pagination
        page={resources.page}
        pageCount={resources.pageCount}
        basePath="/resources"
      />
    </>
  )
}
