"use client"

import dynamic from "next/dynamic"

// goban-web registers custom elements, which only exist in the browser.
export const GamePreviewBoard = dynamic(
  () =>
    import("./game-preview-board-client").then(
      (loaded) => loaded.GamePreviewBoardClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="border-divider aspect-square w-full animate-pulse border"
      />
    ),
  },
)
