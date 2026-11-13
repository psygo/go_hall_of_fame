import Link from "next/link"

import { dashboardState } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

export async function DashboardScreen() {
  const summary = await dashboardState.loadDashboard()

  const cards = [
    {
      href: "/admin/players",
      figure: summary.playerCount,
      label: "Players",
    },
    {
      href: "/admin/games",
      figure: summary.gameCount,
      label: "Games",
    },
    {
      href: "/admin/timeline",
      figure: summary.timelineEventCount,
      label: "Timeline events",
    },
    {
      href: "/admin/criteria",
      figure: summary.criterionCount,
      label: "Criteria",
    },
    {
      href: "/admin/nominations",
      figure: summary.pendingNominationCount,
      label: "Pending nominations",
    },
  ]

  return (
    <>
      <PageHeader eyebrow="Admin" title="Dashboard" />
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]">
        {cards.map(({ href, figure, label }) => (
          <Link
            key={href}
            href={href}
            className="border-divider text-ink hover:bg-accent-100 hover:text-ink flex flex-col gap-2 border-r border-b px-5 py-7 no-underline"
          >
            <div className="text-accent text-5xl leading-none font-bold">
              {figure}
            </div>
            <div className="font-bold">{label}</div>
            <div className="text-[13px] font-bold">
              Manage →
            </div>
          </Link>
        ))}
      </section>
    </>
  )
}
