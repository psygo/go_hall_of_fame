import type { ReactNode } from "react"

/** For layouts that exist only to carry metadata. */
export function PassThroughLayout({
  children,
}: {
  readonly children: ReactNode
}) {
  return children
}
