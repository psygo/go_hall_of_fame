import type { ReactNode } from "react"

export function SectionLabel({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="text-accent-700 font-mono text-[11px] font-bold tracking-[0.1em] uppercase">
      {children}
    </div>
  )
}
