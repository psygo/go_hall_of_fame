"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { EditPageButton } from "./edit-page-button"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu, type NavAdmin } from "./user-menu"

const NAV_ITEMS = [
  { href: "/players", label: "Players" },
  { href: "/games", label: "Games" },
  { href: "/timeline", label: "Timeline" },
  { href: "/induction", label: "Induction" },
] as const

const linkClass =
  "text-sm text-ink no-underline hover:text-accent aria-[current=page]:text-accent"

type SiteNavProps = {
  readonly admin: NavAdmin | null
  readonly signOut: () => Promise<void>
}

export function SiteNav({ admin, signOut }: SiteNavProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const currentOf = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)
      ? "page"
      : undefined

  return (
    <header>
      <nav
        aria-label="Main"
        className="border-divider flex flex-wrap items-center gap-x-5 gap-y-1 border-b px-4 py-3"
      >
        <Link
          href="/"
          className="text-ink hover:text-ink mr-auto text-lg font-semibold no-underline"
          onClick={() => setIsMenuOpen(false)}
        >
          Go / Hall of Fame
        </Link>
        <div className="hidden items-center gap-5 min-[720px]:flex">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass}
              aria-current={currentOf(href)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/induction"
            className="btn btn-primary"
          >
            Nominate
          </Link>
        </div>
        {admin !== null && <EditPageButton />}
        <ThemeToggle />
        <button
          type="button"
          className="btn btn-secondary min-[720px]:hidden"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? "Close" : "Menu"}
        </button>
        {admin !== null && (
          <UserMenu admin={admin} signOut={signOut} />
        )}
      </nav>
      {isMenuOpen && (
        <div className="border-divider flex flex-col border-b min-[720px]:hidden">
          {[
            ...NAV_ITEMS,
            { href: "/induction", label: "Nominate" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              aria-current={
                label === "Nominate"
                  ? undefined
                  : currentOf(href)
              }
              onClick={() => setIsMenuOpen(false)}
              className="border-divider text-ink hover:text-accent aria-[current=page]:text-accent border-t px-4 py-3.5 text-lg font-bold no-underline"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
