import type { ReactNode } from "react"

export function AdminSection({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <section className="max-w-[760px] px-4 pt-8 pb-14">
      {children}
    </section>
  )
}

export function AdminList({
  children,
}: {
  readonly children: ReactNode
}) {
  return <ul className="m-0 list-none p-0">{children}</ul>
}

export function AdminListRow({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <li className="border-divider flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3.5">
      {children}
    </li>
  )
}
