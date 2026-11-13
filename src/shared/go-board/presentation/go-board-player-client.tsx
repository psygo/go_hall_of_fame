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
  /**
   * The move (1-based) the board opens on and draws in the accent color. Later moves are one click
   * away, earlier ones too.
   */
  readonly highlightMove?: number
}

const BOARD_WIDTH = 560

/** A board with its controls and, below them, the players. Centered on the page. */
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
    <GoBoardContainer
      style={{
        width: BOARD_WIDTH,
        maxWidth: "100%",
        marginInline: "auto",
      }}
    >
      <GoBoard
        ref={board}
        sgf={sgf}
        theme={theme}
        coordinates="false"
        style={{ maxWidth: "100%" }}
        onSgfLoaded={() => {
          if (highlightMove !== undefined) {
            board.current?.goToMove(highlightMove)
          }
        }}
      />
      <GoBoardControls />
      <GoMetadataContainer />
    </GoBoardContainer>
  )
}
