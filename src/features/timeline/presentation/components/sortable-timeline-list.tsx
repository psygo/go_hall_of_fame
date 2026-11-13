"use client"

import Link from "next/link"
import { useState, useTransition } from "react"

import { ConfirmDeleteButton } from "@/shared/ui/presentation/confirm-delete-button"

import {
  deleteTimelineEventAction,
  reorderTimelineAction,
} from "../state/timeline-admin-actions"

type SortableEvent = {
  readonly id: number
  readonly year: string
  readonly title: string
}

function moved<T>(
  items: readonly T[],
  from: number,
  to: number,
): readonly T[] {
  if (to < 0 || to >= items.length || from === to)
    return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** The timeline's events as a list the admin reorders by dragging (or with the arrow buttons). */
export function SortableTimelineList({
  events,
}: {
  readonly events: readonly SortableEvent[]
}) {
  const [order, setOrder] = useState(events)
  const [dragged, setDragged] = useState<number | null>(
    null,
  )
  const [isPending, startTransition] = useTransition()
  const [failed, setFailed] = useState(false)

  function commit(next: readonly SortableEvent[]) {
    if (next === order) return
    const previous = order
    setOrder(next)
    setFailed(false)
    startTransition(async () => {
      try {
        await reorderTimelineAction(
          next.map((event) => event.id),
        )
      } catch {
        setOrder(previous)
        setFailed(true)
      }
    })
  }

  return (
    <>
      <p className="px-4 pt-4 text-sm opacity-70">
        Drag an event up or down to reorder the timeline
        {isPending ? " (saving…)" : ""}.
      </p>
      {failed && (
        <p
          role="alert"
          className="text-accent-700 px-4 pt-2 text-sm font-bold"
        >
          The new order could not be saved. Try again.
        </p>
      )}
      <ul className="m-0 list-none p-0">
        {order.map((event, index) => (
          <li
            key={event.id}
            draggable
            onDragStart={() => setDragged(index)}
            onDragEnd={() => setDragged(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragged !== null)
                commit(moved(order, dragged, index))
              setDragged(null)
            }}
            className={`border-divider flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5 ${dragged === index ? "opacity-40" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                title="Drag to reorder"
                className="cursor-grab text-xl leading-none opacity-60 select-none"
              >
                ⠿
              </span>
              <div>
                <span className="text-accent mr-3 font-bold">
                  {event.year}
                </span>
                <span className="font-bold">
                  {event.title}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-secondary px-2.5"
                aria-label={`Move “${event.title}” up`}
                disabled={index === 0}
                onClick={() =>
                  commit(moved(order, index, index - 1))
                }
              >
                ↑
              </button>
              <button
                type="button"
                className="btn btn-secondary px-2.5"
                aria-label={`Move “${event.title}” down`}
                disabled={index === order.length - 1}
                onClick={() =>
                  commit(moved(order, index, index + 1))
                }
              >
                ↓
              </button>
              <Link
                href={`/admin/timeline/${event.id}`}
                className="btn btn-secondary"
              >
                Edit
              </Link>
              <ConfirmDeleteButton
                action={deleteTimelineEventAction.bind(
                  null,
                  event.id,
                )}
                label="Delete"
                confirmText={`Delete “${event.title}” from the timeline?`}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
