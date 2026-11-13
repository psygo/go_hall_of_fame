export type Validation<Draft, Errors> =
  | { readonly valid: true; readonly draft: Draft }
  | { readonly valid: false; readonly errors: Errors }

/** What a Save use case returns: it validates first, then writes. */
export type SaveResult<Errors> =
  | { readonly status: "saved" }
  | { readonly status: "invalid"; readonly errors: Errors }
  | { readonly status: "failed"; readonly error: Error }

/** Messages by field name. A field with no entry has no error. */
export type FieldErrors = Partial<Record<string, string>>

/** Drops the entries without a message, so `Object.keys(errors).length === 0` means valid. */
export function collectErrors(
  checks: Readonly<Record<string, string | undefined>>,
): FieldErrors {
  return Object.fromEntries(
    Object.entries(checks).filter(
      ([, message]) => message !== undefined,
    ),
  )
}

export function parseInteger(text: string): number | null {
  return /^-?\d+$/.test(text.trim())
    ? Number(text.trim())
    : null
}

/** A site path ("/portraits/x.webp") or an https URL: never http, javascript:, data: or protocol-relative. */
export function isSafeAssetUrl(url: string): boolean {
  if (url.length > 500 || /[\s\\\u0000-\u001f]/.test(url))
    return false
  const isSitePath =
    url.startsWith("/") && !url.startsWith("//")
  return isSitePath || url.startsWith("https://")
}

/** Slugs that would collide with an admin route such as /admin/players/new. */
export const RESERVED_SLUGS: readonly string[] = ["new"]

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug)
}
