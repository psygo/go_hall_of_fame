import type { ResourceRow } from "@/core/resources"

export function readFormText(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export function readFormFlag(
  formData: FormData,
  key: string,
): boolean {
  return formData.get(key) !== null
}

/** The rows of the resource editor: the fields `resourceUrl` and `resourceDescription`, in order. */
export function readResourceRows(
  formData: FormData,
): ResourceRow[] {
  const urls = readFormTexts(formData, "resourceUrl")
  const descriptions = readFormTexts(
    formData,
    "resourceDescription",
  )
  const count = Math.max(urls.length, descriptions.length)
  return Array.from({ length: count }, (_, index) => ({
    url: urls[index] ?? "",
    description: descriptions[index] ?? "",
  }))
}

export function readFormTexts(
  formData: FormData,
  key: string,
): string[] {
  return formData
    .getAll(key)
    .filter((value) => typeof value === "string")
}
