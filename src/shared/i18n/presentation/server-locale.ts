import { cookies, headers } from "next/headers"

import {
  LOCALE_COOKIE,
  resolveLocale,
  type Locale,
} from "@/core/locales"

import { MESSAGES, type Messages } from "./messages"

/** The visitor's language: their saved choice, else their device's. Opts the page into dynamic rendering. */
export async function getLocale(): Promise<Locale> {
  const [jar, incoming] = await Promise.all([
    cookies(),
    headers(),
  ])
  return resolveLocale(
    jar.get(LOCALE_COOKIE)?.value,
    incoming.get("accept-language"),
  )
}

export async function getMessages(): Promise<Messages> {
  return MESSAGES[await getLocale()]
}
