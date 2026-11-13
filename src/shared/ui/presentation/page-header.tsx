import type { ReactNode } from "react"

export const displayTitleClass =
  "text-[40px] leading-[0.95] min-[720px]:text-[clamp(44px,6vw,80px)]"

type PageHeaderProps = {
  readonly eyebrow: string
  readonly title: string
  readonly children?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: PageHeaderProps) {
  return (
    <section className="border-divider border-b px-4 pt-12 pb-8">
      <div className="mb-3 font-mono text-xs tracking-[0.12em] uppercase">
        {eyebrow}
      </div>
      <h1 className={displayTitleClass}>{title}</h1>
      {children}
    </section>
  )
}
