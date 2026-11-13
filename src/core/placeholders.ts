/** Replaces `{name}` with the value of `name`. Unknown placeholders are left as they are. */
export function fillPlaceholders(
  text: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return text.replace(
    /\{(\w+)\}/g,
    (match, name: string) => {
      return Object.hasOwn(values, name)
        ? String(values[name])
        : match
    },
  )
}
