"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
  LOCALE_COOKIE,
  LOCALES,
  type Locale,
} from "@/core/locales"

import { useLocale } from "./locale-provider"

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

function saveLocale(code: Locale) {
  const secure =
    location.protocol === "https:" ? "; secure" : ""
  document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax${secure}`
}

/** A flag button with a dropdown of the supported languages. The choice is a cookie the server reads. */
export function LocaleMenu() {
  const { locale, messages } = useLocale()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const current = LOCALES.find(
    (candidate) => candidate.code === locale,
  )

  useEffect(() => {
    if (!isOpen) return
    const closeOutside = (event: PointerEvent) => {
      const target = event.target
      if (
        target instanceof Node &&
        !root.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("pointerdown", closeOutside)
    return () =>
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      )
  }, [isOpen])

  function choose(code: Locale) {
    saveLocale(code)
    setIsOpen(false)
    router.refresh()
  }

  return (
    <div
      ref={root}
      className="relative"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !isOpen) return
        setIsOpen(false)
        trigger.current?.focus()
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="btn btn-secondary px-2.5 text-lg leading-none"
        aria-label={`${messages.language}: ${current?.name ?? ""}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden>{current?.flag}</span>
      </button>
      {isOpen && (
        <ul
          aria-label={messages.language}
          className="bg-paper border-divider absolute end-0 top-full z-30 m-0 mt-2 max-h-[70vh] w-56 list-none overflow-y-auto border p-1 shadow-sm"
        >
          {LOCALES.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                lang={option.code}
                aria-pressed={option.code === locale}
                onClick={() => choose(option.code)}
                className="hover:bg-accent-100 aria-pressed:text-accent flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-start text-sm"
              >
                <span aria-hidden className="text-lg">
                  {option.flag}
                </span>
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
