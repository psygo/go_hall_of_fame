/**
 * Plain text from a Markdown string, for places that cannot show formatting: link-preview
 * descriptions and list excerpts (where a nested link would be invalid HTML).
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_~`]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/** The plain text of some Markdown, cut at a word boundary to at most `maxLength` characters. */
export function excerpt(
  markdown: string,
  maxLength = 200,
): string {
  const text = stripMarkdown(markdown)
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > maxLength / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
