"use client"

import type { GoBoardElement } from "goban-web"
import { useEffect, useRef } from "react"
import {
  GoBoard,
  GoBoardContainer,
  GoBoardControls,
  GoMetadataContainer,
} from "goban-web-react"

export type GoBoardPlayerProps = {
  readonly sgf: string
  readonly theme?: string
  /** The move (1-based) to draw in the accent color once the game reaches it. */
  readonly highlightMove?: number
}

export function GoBoardPlayerClient({
  sgf,
  theme = "washi",
  highlightMove,
}: GoBoardPlayerProps) {
  const board = useRef<GoBoardElement>(null)

  useEffect(() => {
    if (highlightMove === undefined) return
    board.current?.setAttribute(
      "highlight-move",
      String(highlightMove),
    )
  }, [highlightMove])

  return (
    <GoBoardContainer style={{ maxWidth: "100%" }}>
      <GoMetadataContainer />
      <GoBoard
        ref={board}
        sgf={sgf}
        theme={theme}
        width={560}
        style={{ maxWidth: "100%" }}
      />
      <GoBoardControls />
    </GoBoardContainer>
  )
}
