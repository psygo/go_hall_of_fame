"use client"

import { GoBoard } from "goban-web-react"
import type { GoBoardElement } from "goban-web"
import { useEffect, useRef, useState } from "react"

export type GamePreviewBoardProps = {
  readonly sgf: string
  /** The move the preview stops on. */
  readonly targetMove?: number
  /** The pause between two moves while the preview plays. */
  readonly intervalMs?: number
  readonly theme?: string
}

const DEFAULT_TARGET_MOVE = 50
const DEFAULT_INTERVAL_MS = 700

/**
 * An interactive board that plays the game from the first move to `targetMove`, one move every
 * `intervalMs`, once it scrolls into view. People who prefer reduced motion get the final position.
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = frame.current
    if (element === null) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.3 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = board.current
    if (!isLoaded || !isVisible || element === null) return
    element.setAttribute(
      "highlight-move",
      String(targetMove),
    )
    const last = Math.min(targetMove, element.moveCount)
    element.goToMove(0)
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
    ) {
      element.goToMove(last)
      return
    }
    const timer = setInterval(() => {
      if (element.moveIndex >= last) clearInterval(timer)
      else element.nextMove()
    }, intervalMs)
    return () => clearInterval(timer)
  }, [isLoaded, isVisible, targetMove, intervalMs])

  return (
    <div ref={frame} className="w-full">
      <GoBoard
        ref={board}
        sgf={sgf}
        theme={theme}
        coordinates="false"
        style={{ maxWidth: "100%" }}
        onSgfLoaded={() => setIsLoaded(true)}
      />
    </div>
  )
}
