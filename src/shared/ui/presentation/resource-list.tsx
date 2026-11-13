import type { ResourceLink } from "@/core/resources"

import { SectionLabel } from "./section-label"

/** The "Resources" section of a game or player page: an unordered list of links. */
export function ResourceList({
  resources,
}: {
  readonly resources: readonly ResourceLink[]
}) {
  if (resources.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>Resources</SectionLabel>
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">
        {resources.map((resource) => (
          <li
            key={`${resource.title || resource.url}-${resource.url}`}
          >
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
    </div>
  )
}
