export type CircularNeighbors<T> = {
  readonly previous: T
  readonly next: T
}

/** The previous and next item of a list that wraps around at both ends. Null when the index is out of range. */
export function findCircularNeighbors<T>(
  items: readonly T[],
  index: number,
): CircularNeighbors<T> | null {
  if (index < 0 || index >= items.length) return null
  const previous =
    items[(index - 1 + items.length) % items.length]
  const next = items[(index + 1) % items.length]
  return { previous, next }
}
