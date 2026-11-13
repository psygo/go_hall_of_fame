export type AdminEditTarget = {
  readonly href: string
  readonly label: string
}

const STATIC_TARGETS: Readonly<
  Record<string, AdminEditTarget>
> = {
  "/": { href: "/admin/pages", label: "Edit page" },
  "/players": {
    href: "/admin/players",
    label: "Edit players",
  },
  "/games": { href: "/admin/games", label: "Edit games" },
  "/timeline": {
    href: "/admin/timeline",
    label: "Edit timeline",
  },
  "/resources": {
    href: "/admin/resources",
    label: "Edit resources",
  },
  "/induction": {
    href: "/admin/criteria",
    label: "Edit criteria",
  },
}

/** Where an admin goes to edit the public page at `pathname`, or null for pages with no editor. */
export function adminEditTargetFor(
  pathname: string,
): AdminEditTarget | null {
  const path =
    pathname.length > 1
      ? pathname.replace(/\/$/, "")
      : pathname
  const detail = /^\/(players|games)\/([^/]+)$/.exec(path)
  if (detail !== null) {
    const [, section, slug] = detail
    return {
      href: `/admin/${section}/${slug}`,
      label:
        section === "players" ? "Edit player" : "Edit game",
    }
  }
  return STATIC_TARGETS[path] ?? null
}
