"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/timeline", label: "Timeline" },
  { href: "/admin/criteria", label: "Criteria" },
  { href: "/admin/nominations", label: "Nominations" },
] as const

export function AdminNav() {
  const pathname = usePathname()
  const isCurrent = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <nav
      aria-label="Admin"
      className="border-divider flex flex-wrap gap-x-5 gap-y-1 border-b px-4 py-2.5 font-mono text-xs tracking-[0.08em] uppercase"
    >
      {ADMIN_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            isCurrent(href) ? "page" : undefined
          }
          className="text-ink hover:text-accent aria-[current=page]:text-accent no-underline"
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
