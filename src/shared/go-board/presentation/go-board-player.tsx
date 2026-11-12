"use client"

import dynamic from "next/dynamic"

// goban-web registers custom elements, which only exist in the browser.
export const GoBoardPlayer = dynamic(
  () =>
    import("./go-board-player-client").then(
      (loaded) => loaded.GoBoardPlayerClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="border-divider aspect-square w-full max-w-[560px] border" />
    ),
  },
)
