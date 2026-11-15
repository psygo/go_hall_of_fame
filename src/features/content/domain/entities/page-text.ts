import {
  collectErrors,
  type FieldErrors,
  type Validation,
} from "@/core/validation"

export const PAGE_IDS = [
  "home",
  "players",
  "games",
  "timeline",
  "induction",
  "resources",
] as const

export type PageId = (typeof PAGE_IDS)[number]

export type PageTextDefinition = {
  /** "page.name", also the name of the form field. */
  readonly key: string
  readonly page: PageId
  readonly label: string
  readonly defaultValue: string
  readonly maxLength: number
  readonly multiline: boolean
  readonly hint?: string
}

export const PAGE_TEXT_DEFINITIONS: readonly PageTextDefinition[] =
  [
    {
      key: "home.title",
      page: "home",
      label: "Hero heading",
      defaultValue:
        "The works of art and the legendary players in the history of Go.",
      maxLength: 120,
      multiline: false,
    },
    {
      key: "home.intro",
      page: "home",
      label: "Hero introduction",
      defaultValue:
        "The iconic masterpieces and the artists who made their mark in the most complex game of all.",
      maxLength: 300,
      multiline: true,
      hint: "{playerCount} and {gameCount} are replaced by the live counts, if you use them.",
    },
    {
      key: "home.playersCardText",
      page: "home",
      label: "Players card text",
      defaultValue:
        "From Dosaku to Shin Jinseo, across Japan, China and Korea.",
      maxLength: 120,
      multiline: false,
    },
    {
      key: "home.gamesCardText",
      page: "home",
      label: "Games card text",
      defaultValue:
        "The moves that stopped the room and rewrote theory.",
      maxLength: 120,
      multiline: false,
    },
    {
      key: "home.timelineCardText",
      page: "home",
      label: "Timeline card text",
      defaultValue:
        "A timeline from the Edo academy to the age of AI.",
      maxLength: 120,
      multiline: false,
    },
    {
      key: "players.eyebrow",
      page: "players",
      label: "Eyebrow",
      defaultValue: "Inductees",
      maxLength: 40,
      multiline: false,
    },
    {
      key: "players.title",
      page: "players",
      label: "Heading",
      defaultValue: "Legendary Players",
      maxLength: 80,
      multiline: false,
    },
    {
      key: "games.eyebrow",
      page: "games",
      label: "Eyebrow",
      defaultValue: "The record",
      maxLength: 40,
      multiline: false,
    },
    {
      key: "games.title",
      page: "games",
      label: "Heading",
      defaultValue: "Legendary Games",
      maxLength: 80,
      multiline: false,
    },
    {
      key: "timeline.title",
      page: "timeline",
      label: "Heading",
      defaultValue: "Timeline",
      maxLength: 80,
      multiline: false,
    },
    {
      key: "resources.eyebrow",
      page: "resources",
      label: "Eyebrow",
      defaultValue: "Further reading",
      maxLength: 40,
      multiline: false,
    },
    {
      key: "resources.title",
      page: "resources",
      label: "Heading",
      defaultValue: "Resources",
      maxLength: 80,
      multiline: false,
    },
    {
      key: "resources.description",
      page: "resources",
      label: "Description",
      defaultValue:
        "Books, tools and sites for going further into the game.",
      maxLength: 400,
      multiline: true,
    },
    {
      key: "induction.eyebrow",
      page: "induction",
      label: "Eyebrow",
      defaultValue: "Induction",
      maxLength: 40,
      multiline: false,
    },
    {
      key: "induction.title",
      page: "induction",
      label: "Heading",
      defaultValue: "How a name enters the Hall",
      maxLength: 80,
      multiline: false,
    },
    {
      key: "induction.formTitle",
      page: "induction",
      label: "Form heading",
      defaultValue: "Nominate a player or a game",
      maxLength: 80,
      multiline: false,
    },
  ]

/** Page texts by key, such as { "home.title": "..." }. */
export type PageTexts = Readonly<Record<string, string>>

/** The texts of a page: the saved value where there is one, the default otherwise. */
export function resolvePageTexts(
  page: PageId,
  overrides: Readonly<Record<string, string>>,
): PageTexts {
  return Object.fromEntries(
    PAGE_TEXT_DEFINITIONS.filter(
      (definition) => definition.page === page,
    ).map((definition) => [
      definition.key,
      overrides[definition.key] ?? definition.defaultValue,
    ]),
  )
}

export type EditableText = {
  readonly definition: PageTextDefinition
  /** The saved value, or the default when nothing is saved. */
  readonly value: string
}

export function toEditableTexts(
  overrides: Readonly<Record<string, string>>,
): readonly EditableText[] {
  return PAGE_TEXT_DEFINITIONS.map((definition) => ({
    definition,
    value:
      overrides[definition.key] ?? definition.defaultValue,
  }))
}

export type SiteTextChanges = {
  readonly set: Readonly<Record<string, string>>
  /** Keys whose saved value is removed, so they show their default again. */
  readonly clear: readonly string[]
}

/** A blank value, or one equal to the default, removes the saved value. */
export function validateSiteTextsForm(
  form: Readonly<Record<string, string>>,
): Validation<SiteTextChanges, FieldErrors> {
  const trimmed = PAGE_TEXT_DEFINITIONS.map(
    (definition) => ({
      definition,
      value: (form[definition.key] ?? "").trim(),
    }),
  )
  const errors = collectErrors(
    Object.fromEntries(
      trimmed.map(({ definition, value }) => [
        definition.key,
        value.length > definition.maxLength
          ? `Use at most ${definition.maxLength} characters.`
          : undefined,
      ]),
    ),
  )
  if (Object.keys(errors).length > 0)
    return { valid: false, errors }
  const isDefault = ({
    definition,
    value,
  }: (typeof trimmed)[number]) =>
    value === "" || value === definition.defaultValue
  return {
    valid: true,
    draft: {
      set: Object.fromEntries(
        trimmed
          .filter((entry) => !isDefault(entry))
          .map(({ definition, value }) => [
            definition.key,
            value,
          ]),
      ),
      clear: trimmed
        .filter(isDefault)
        .map(({ definition }) => definition.key),
    },
  }
}
