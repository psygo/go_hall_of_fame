"use client"

import { useEffect, useRef, useState } from "react"

import type { Slice } from "@/core/list-query"

import type { TimelinePlacement } from "../../domain/entities/timeline-layout"
import { loadTimelineChunkAction } from "../state/timeline-actions"
import {
  TimelineItem,
  TimelineItemSkeleton,
} from "./timeline-item"

type TimelineFeedProps = {
  readonly order: string
  readonly first: Slice<TimelinePlacement>
}

const SKELETON_SIDES = ["left", "right", "left"] as const

/** The timeline list: shows the first chunk, then loads the next one whenever the end comes into view. */
export function TimelineFeed({
  order,
  first,
}: TimelineFeedProps) {
  const [items, setItems] = useState(first.items)
  const [nextOffset, setNextOffset] = useState(
    first.nextOffset,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  async function loadMore() {
    if (nextOffset === null || isLoading) return
    setIsLoading(true)
    setHasFailed(false)
    try {
      const chunk = await loadTimelineChunkAction(
        order,
        nextOffset,
      )
      setItems((current) => [...current, ...chunk.items])
      setNextOffset(chunk.nextOffset)
    } catch {
      setHasFailed(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const element = end.current
    if (element === null || hasFailed) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore()
      },
      { rootMargin: "400px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  })

  return (
    <>
      <ol className="m-0 list-none p-0">
        {items.map((placement) => (
          <TimelineItem
            key={`${placement.index}-${placement.event.id}`}
            placement={placement}
          />
        ))}
        {isLoading &&
          SKELETON_SIDES.map((side, position) => (
            <TimelineItemSkeleton
              key={position}
              side={side}
            />
          ))}
      </ol>
      <div ref={end} className="h-px" />
      <div
        role="status"
        aria-live="polite"
        className="py-4 text-center text-sm"
      >
        {isLoading && "Loading more of the timeline…"}
        {nextOffset === null &&
          "That is the whole timeline."}
        {hasFailed && (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="btn btn-secondary"
          >
            Could not load more. Try again
          </button>
        )}
      </div>
    </>
  )
}
