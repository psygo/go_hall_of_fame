import { and, asc, eq, isNull, type SQL } from "drizzle-orm"

import type { ResourceLink } from "@/core/resources"

import type { Database } from "./database"
import { resourcesTable } from "./schema"

type Executor = Pick<
  Database,
  "select" | "insert" | "delete"
>

/** A game, a player, or the site itself (the Resources page, which has no owner row). */
export type ResourceOwner =
  | {
      readonly kind: "game" | "player"
      readonly id: number
    }
  | { readonly kind: "site" }

function ownerCondition(
  owner: ResourceOwner,
): SQL | undefined {
  if (owner.kind === "site") {
    return and(
      isNull(resourcesTable.gameId),
      isNull(resourcesTable.playerId),
    )
  }
  return eq(
    owner.kind === "game"
      ? resourcesTable.gameId
      : resourcesTable.playerId,
    owner.id,
  )
}

/** The resources of one game or player, in the order the admin arranged them. */
export function selectResources(
  executor: Executor,
  owner: ResourceOwner,
) {
  return executor
    .select({
      title: resourcesTable.title,
      url: resourcesTable.url,
      description: resourcesTable.description,
    })
    .from(resourcesTable)
    .where(ownerCondition(owner))
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
    .where(ownerCondition(owner))
  if (links.length === 0) return
  await executor.insert(resourcesTable).values(
    links.map((link, position) => ({
      gameId: owner.kind === "game" ? owner.id : null,
      playerId: owner.kind === "player" ? owner.id : null,
      title: link.title,
      url: link.url,
      description: link.description,
      position,
    })),
  )
}
