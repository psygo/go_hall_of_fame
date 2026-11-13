export const TAG_LIMITS = {
  maxTags: 8,
  maxLength: 24,
} as const

export type TagsValidation =
  | {
      readonly valid: true
      readonly tags: readonly string[]
    }
  | { readonly valid: false; readonly error: string }

/** Splits comma-separated text into tags: trimmed, single-spaced, without blanks or repeats (any case). */
export function parseTags(text: string): readonly string[] {
  const seen = new Set<string>()
  const tags: string[] = []
  for (const part of text.split(",")) {
    const tag = part.trim().replace(/\s+/g, " ")
    const key = tag.toLowerCase()
    if (tag === "" || seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

/** Tags are optional: blank text is a valid, empty list. */
export function validateTags(text: string): TagsValidation {
  const tags = parseTags(text)
  if (tags.length > TAG_LIMITS.maxTags) {
    return {
      valid: false,
      error: `Use at most ${TAG_LIMITS.maxTags} tags.`,
    }
  }
  if (
    tags.some((tag) => tag.length > TAG_LIMITS.maxLength)
  ) {
    return {
      valid: false,
      error: `Keep each tag to ${TAG_LIMITS.maxLength} characters or fewer.`,
    }
  }
  return { valid: true, tags }
}

/** The text an admin edits: the tags joined by commas. */
export function formatTags(
  tags: readonly string[],
): string {
  return tags.join(", ")
}
