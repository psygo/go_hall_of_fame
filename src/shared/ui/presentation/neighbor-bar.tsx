import Link from "next/link"

type Neighbor = {
  readonly href: string
  readonly name: string
}

type NeighborBarProps = {
  readonly previous: Neighbor
  readonly next: Neighbor
}

const cellClass =
  "block px-4 py-5 text-ink no-underline hover:bg-accent-100 hover:text-ink"

export function NeighborBar({
  previous,
  next,
}: NeighborBarProps) {
  return (
    <section className="grid grid-cols-2">
      <Link
        href={previous.href}
        className={`${cellClass} border-divider border-r`}
      >
        <div className="text-xs">← Previous</div>
        <div className="text-xl font-bold">
          {previous.name}
        </div>
      </Link>
      <Link
        href={next.href}
        className={`${cellClass} text-right`}
      >
        <div className="text-xs">Next →</div>
        <div className="text-xl font-bold">{next.name}</div>
      </Link>
    </section>
  )
}
