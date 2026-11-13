import { asc, eq } from "drizzle-orm"

import type { ResourceLink } from "@/core/resources"

import type { Database } from "./database"
import { resourcesTable } from "./schema"

type Executor = Pick<
  Database,
  "select" | "insert" | "delete"
>

export type ResourceOwner = {
  readonly kind: "game" | "player"
  readonly id: number
}

function ownerColumn(owner: ResourceOwner) {
  return owner.kind === "game"
    ? resourcesTable.gameId
    : resourcesTable.playerId
}

/** The resources of one game or player, in the order the admin arranged them. */
export function selectResources(
  executor: Executor,
  owner: ResourceOwner,
) {
  return executor
    .select({
      url: resourcesTable.url,
      description: resourcesTable.description,
    })
    .from(resourcesTable)
    .where(eq(ownerColumn(owner), owner.id))
    .orderBy(
      asc(resourcesTable.position),
      asc(resourcesTable.id),
    )
}

/** Replaces all the resources of one game or player. */
export async function replaceResources(
  executor: Executor,
  owner: ResourceOwner,
  links: readonly ResourceLink[],
): Promise<void> {
  await executor
    .delete(resourcesTable)
    .where(eq(ownerColumn(owner), owner.id))
  if (links.length === 0) return
  await executor.insert(resourcesTable).values(
    links.map((link, position) => ({
      gameId: owner.kind === "game" ? owner.id : null,
      playerId: owner.kind === "player" ? owner.id : null,
      url: link.url,
      description: link.description,
      position,
    })),
  )
}
