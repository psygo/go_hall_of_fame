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

export function readFormTexts(
  formData: FormData,
  key: string,
): string[] {
  return formData
    .getAll(key)
    .filter((value) => typeof value === "string")
}
