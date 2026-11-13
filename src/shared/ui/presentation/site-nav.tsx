"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { EditPageButton } from "./edit-page-button"
import { LocaleMenu } from "@/shared/i18n/presentation/locale-menu"
import { useLocale } from "@/shared/i18n/presentation/locale-provider"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu, type NavAdmin } from "./user-menu"

const NAV_ITEMS = [
  { href: "/players", label: "players" },
  { href: "/games", label: "games" },
  { href: "/timeline", label: "timeline" },
  { href: "/induction", label: "induction" },
  { href: "/resources", label: "resources" },
  { href: "/about", label: "about" },
] as const

const linkClass =
  "text-sm min-[1000px]:text-base text-ink no-underline hover:text-accent aria-[current=page]:text-accent"

type SiteNavProps = {
  readonly admin: NavAdmin | null
  readonly signOut: () => Promise<void>
}

export function SiteNav({ admin, signOut }: SiteNavProps) {
  const { messages } = useLocale()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // Wide enough for the links? Measured: they collapse into the menu as soon as the row would wrap.
  const [isCollapsed, setIsCollapsed] = useState(false)
  const nav = useRef<HTMLElement>(null)
  // The width the links needed when they last overflowed, for which labels (they change by language).
  const widthNeeded = useRef({ width: 0, labels: messages })

  useEffect(() => {
    const element = nav.current
    if (element === null) return
    const observer = new ResizeObserver(() => {
      if (!isCollapsed) {
        if (element.scrollWidth > element.clientWidth) {
          widthNeeded.current = {
            width: element.scrollWidth,
            labels: messages,
          }
          setIsCollapsed(true)
        }
      } else if (
        // Wider now, or the labels changed so the old measure is stale: show the links and measure again.
        widthNeeded.current.labels !== messages ||
        element.clientWidth >= widthNeeded.current.width
      ) {
        setIsCollapsed(false)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [isCollapsed, messages, admin])

  const currentOf = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)
      ? "page"
      : undefined

  return (
    <header>
      <nav
        ref={nav}
        aria-label="Main"
        className="border-divider flex items-center gap-x-5 border-b px-4 py-3"
      >
        <Link
          href="/"
          className="text-ink hover:text-ink mr-auto flex shrink-0 items-center gap-3 text-lg font-semibold whitespace-nowrap no-underline"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            unoptimized
            className="size-8"
          />
          Go | Hall of Fame
        </Link>
        <div
          className={`items-center gap-5 whitespace-nowrap max-[719px]:hidden ${isCollapsed ? "hidden" : "flex"}`}
        >
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass}
              aria-current={currentOf(href)}
            >
              {messages[label]}
            </Link>
          ))}
        </div>
        {admin !== null && <EditPageButton />}
        <ThemeToggle />
        <LocaleMenu />
        <button
          type="button"
          className={`btn btn-secondary px-2.5 ${isCollapsed ? "" : "min-[720px]:hidden"}`}
          aria-label={
            isMenuOpen ? messages.close : messages.menu
          }
          title={
            isMenuOpen ? messages.close : messages.menu
          }
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        {admin !== null && (
          <UserMenu admin={admin} signOut={signOut} />
        )}
      </nav>
      {isMenuOpen && (
        <div
          id="site-menu"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsMenuOpen(false)
          }}
          className={`border-divider flex-col border-b ${isCollapsed ? "flex" : "flex min-[720px]:hidden"}`}
        >
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={currentOf(href)}
              onClick={() => setIsMenuOpen(false)}
              className="border-divider text-ink hover:text-accent aria-[current=page]:text-accent border-t px-4 py-3.5 text-lg font-bold no-underline"
            >
              {messages[label]}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
