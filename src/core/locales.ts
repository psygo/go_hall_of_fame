export const LOCALE_COOKIE = "locale"

export const LOCALES = [
  { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "pt", name: "Português", flag: "🇧🇷", dir: "ltr" },
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "it", name: "Italiano", flag: "🇮🇹", dir: "ltr" },
  {
    code: "nl",
    name: "Nederlands",
    flag: "🇳🇱",
    dir: "ltr",
  },
  { code: "sv", name: "Svenska", flag: "🇸🇪", dir: "ltr" },
  { code: "pl", name: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "ru", name: "Русский", flag: "🇷🇺", dir: "ltr" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
  {
    code: "id",
    name: "Bahasa Indonesia",
    flag: "🇮🇩",
    dir: "ltr",
  },
  {
    code: "vi",
    name: "Tiếng Việt",
    flag: "🇻🇳",
    dir: "ltr",
  },
  { code: "zh", name: "中文", flag: "🇨🇳", dir: "ltr" },
  { code: "ja", name: "日本語", flag: "🇯🇵", dir: "ltr" },
  { code: "ko", name: "한국어", flag: "🇰🇷", dir: "ltr" },
] as const

export type Locale = (typeof LOCALES)[number]["code"]

export const DEFAULT_LOCALE: Locale = "en"

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale.code === value)
}

export function directionOf(locale: Locale): "ltr" | "rtl" {
  return (
    LOCALES.find((candidate) => candidate.code === locale)
      ?.dir ?? "ltr"
  )
}

/**
 * The first language of an Accept-Language header that the site supports ("pt-BR,pt;q=0.9,en;q=0.8"
 * gives "pt"), highest quality first. English when nothing matches.
 */
export function pickLocale(
  acceptLanguage: string | null | undefined,
): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";")
      const q = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="))
      const quality =
        q === undefined ? 1 : Number(q.slice(2))
      return {
        base: tag.trim().toLowerCase().split("-")[0] ?? "",
        quality: Number.isNaN(quality) ? 0 : quality,
        index,
      }
    })
    .filter((entry) => entry.quality > 0)
    .sort(
      (a, b) => b.quality - a.quality || a.index - b.index,
    )
  const match = ranked.find((entry) => isLocale(entry.base))
  return match !== undefined && isLocale(match.base)
    ? match.base
    : DEFAULT_LOCALE
}

/** The saved choice wins over the device's languages. */
export function resolveLocale(
  saved: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  return isLocale(saved)
    ? saved
    : pickLocale(acceptLanguage)
}
