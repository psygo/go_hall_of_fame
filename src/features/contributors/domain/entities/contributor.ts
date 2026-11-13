export const CONTRIBUTOR_KINDS = [
  "person",
  "organization",
  "entity",
] as const

export type ContributorKind =
  (typeof CONTRIBUTOR_KINDS)[number]

export const CONTRIBUTOR_KIND_LABELS: Readonly<
  Record<ContributorKind, string>
> = {
  person: "Person",
  organization: "Organization",
  entity: "Entity",
}

export function isContributorKind(
  value: string,
): value is ContributorKind {
  return CONTRIBUTOR_KINDS.some((kind) => kind === value)
}

/** Someone, or something, that served the game without being a legendary player. */
export type Contributor = {
  readonly slug: string
  readonly name: string
  readonly kind: ContributorKind
  /** The year of birth, or of founding. */
  readonly birthYear: number
  /** What they did for Go, in a line. */
  readonly role: string
  /** Free text: "2014–2017", "since 1990". May be blank. */
  readonly period: string
  /** Markdown. */
  readonly bio: string
  readonly photoUrl: string | null
  readonly photoPosition: string
  /** Only admins see a draft. */
  readonly isDraft: boolean
}
