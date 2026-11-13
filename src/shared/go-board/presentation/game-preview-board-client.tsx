"use client"

import { GoBoard } from "goban-web-react"
import type { GoBoardElement } from "goban-web"
import { useEffect, useRef, useState } from "react"

export type GamePreviewBoardProps = {
  readonly sgf: string
  /** The move the board rests on (and draws in the accent color), and where a replay stops. */
  readonly targetMove?: number
  /** The pause between two moves while the game replays. */
  readonly intervalMs?: number
  readonly theme?: string
}

const DEFAULT_TARGET_MOVE = 50
const DEFAULT_INTERVAL_MS = 700

/**
 * A board that cannot be played on. It rests on `targetMove`; while the pointer is on its card (or
 * focus is inside it) the game replays from the first move, one move every `intervalMs`, and the
 * board returns to `targetMove` when the pointer leaves.
 */
export function GamePreviewBoardClient({
  sgf,
  targetMove = DEFAULT_TARGET_MOVE,
  intervalMs = DEFAULT_INTERVAL_MS,
  theme = "washi",
}: GamePreviewBoardProps) {
  const frame = useRef<HTMLDivElement>(null)
  const board = useRef<GoBoardElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const element = board.current
    if (!isLoaded || element === null) return
    element.setAttribute(
      "highlight-move",
      String(targetMove),
    )
    element.goToMove(
      Math.min(targetMove, element.moveCount),
    )
  }, [isLoaded, targetMove])

  useEffect(() => {
    const element = board.current
    const card = frame.current?.closest("article")
    if (!isLoaded || element === null || !card) return
    const lastMove = () =>
      Math.min(targetMove, element.moveCount)
    let timer: ReturnType<typeof setInterval> | null = null

    const stop = () => {
      if (timer !== null) clearInterval(timer)
      timer = null
    }
    const replay = (event: Event) => {
      if (isTouch(event)) return
      stop()
      element.goToMove(0)
      timer = setInterval(() => {
        if (element.moveIndex >= lastMove()) stop()
        else element.nextMove()
      }, intervalMs)
    }
    const rest = (event: Event) => {
      if (isTouch(event)) return
      if (
        event.type === "pointerleave" &&
        card.matches(":focus-within")
      )
        return
      stop()
      element.goToMove(lastMove())
    }

    card.addEventListener("pointerenter", replay)
    card.addEventListener("pointerleave", rest)
    card.addEventListener("focusin", replay)
    card.addEventListener("focusout", rest)
    return () => {
      stop()
      card.removeEventListener("pointerenter", replay)
      card.removeEventListener("pointerleave", rest)
      card.removeEventListener("focusin", replay)
      card.removeEventListener("focusout", rest)
    }
  }, [isLoaded, targetMove, intervalMs])

  return (
    <div ref={frame} className="w-full">
      <GoBoard
        ref={board}
        sgf={sgf}
        theme={theme}
        coordinates="false"
        interactive={false}
        keyboardShortcuts={false}
        style={{ maxWidth: "100%" }}
        onSgfLoaded={() => setIsLoaded(true)}
      />
    </div>
  )
}

/** A tap fires enter and leave at once, so touch gets no replay. */
function isTouch(event: Event): boolean {
  return (
    event instanceof PointerEvent &&
    event.pointerType === "touch"
  )
}
