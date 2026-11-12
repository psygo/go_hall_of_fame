import type { ReactNode } from "react"

type LabelledFactProps = {
  readonly label: string
  readonly children: ReactNode
}

export function LabelledFact({
  label,
  children,
}: LabelledFactProps) {
  return (
    <div className="py-3">
      <div className="text-[11px] tracking-[0.1em] uppercase opacity-70">
        {label}
      </div>
      <div className="font-bold">{children}</div>
    </div>
  )
}
