"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type NavAdmin = {
  readonly name: string
  readonly email: string
  readonly initials: string
}

type UserMenuProps = {
  readonly admin: NavAdmin
  readonly signOut: () => Promise<void>
}

export function UserMenu({
  admin,
  signOut,
}: UserMenuProps) {
  const pathname = usePathname()

  return (
    // Keyed by the route, so the menu closes itself after navigating.
    <details key={pathname} className="relative">
      <summary
        aria-label={`Account menu for ${admin.name}`}
        title={admin.name}
        className="bg-accent text-paper flex size-9 cursor-pointer list-none items-center justify-center rounded-full font-mono text-xs font-bold marker:hidden [&::-webkit-details-marker]:hidden"
      >
        {admin.initials}
      </summary>
      <div className="bg-paper border-divider absolute top-full right-0 z-30 mt-2 w-64 border p-4 shadow-sm">
        <div className="font-bold">{admin.name}</div>
        <div className="mb-3 truncate text-xs opacity-70">
          {admin.email}
        </div>
        <div className="border-divider flex flex-col gap-2 border-t pt-3">
          <Link href="/admin" className="text-sm font-bold">
            Admin dashboard
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="btn btn-secondary w-full"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  )
}
