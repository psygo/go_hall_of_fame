"use client"

import {
  createContext,
  useContext,
  type ReactNode,
} from "react"

import type { Locale } from "@/core/locales"

import type { Messages } from "./messages"

type LocaleContextValue = {
  readonly locale: Locale
  readonly messages: Messages
}

const LocaleContext =
  createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  messages,
  children,
}: LocaleContextValue & { readonly children: ReactNode }) {
  return (
    <LocaleContext value={{ locale, messages }}>
      {children}
    </LocaleContext>
  )
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext)
  if (value === null) {
    throw new Error("useLocale needs a LocaleProvider")
  }
  return value
}
