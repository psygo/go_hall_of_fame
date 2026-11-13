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
  "/contributors": {
    href: "/admin/contributors",
    label: "Edit contributors",
  },
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

const DETAIL_LABELS: Readonly<Record<string, string>> = {
  players: "Edit player",
  games: "Edit game",
  contributors: "Edit contributor",
}

/** Where an admin goes to edit the public page at `pathname`, or null for pages with no editor. */
export function adminEditTargetFor(
  pathname: string,
): AdminEditTarget | null {
  const path =
    pathname.length > 1
      ? pathname.replace(/\/$/, "")
      : pathname
  const detail =
    /^\/(players|games|contributors)\/([^/]+)$/.exec(path)
  if (detail !== null) {
    const [, section, slug] = detail
    return {
      href: `/admin/${section}/${slug}`,
      label: DETAIL_LABELS[section] ?? "Edit",
    }
  }
  return STATIC_TARGETS[path] ?? null
}
