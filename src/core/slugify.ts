/** Lowercase ASCII words joined by hyphens. Returns "" when nothing usable remains (for example for a CJK-only name). */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(text: string): boolean {
  return SLUG_PATTERN.test(text) && text.length <= 80
}
