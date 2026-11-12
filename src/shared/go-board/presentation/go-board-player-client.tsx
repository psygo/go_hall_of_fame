"use client"

import {
  GoBoard,
  GoBoardContainer,
  GoBoardControls,
  GoMetadataContainer,
} from "goban-web-react"

export type GoBoardPlayerProps = {
  readonly sgf: string
  readonly theme?: string
}

export function GoBoardPlayerClient({
  sgf,
  theme = "bookish",
}: GoBoardPlayerProps) {
  return (
    <GoBoardContainer style={{ maxWidth: "100%" }}>
      <GoMetadataContainer />
      <GoBoard
        sgf={sgf}
        theme={theme}
        width={560}
        style={{ maxWidth: "100%" }}
      />
      <GoBoardControls />
    </GoBoardContainer>
  )
}
