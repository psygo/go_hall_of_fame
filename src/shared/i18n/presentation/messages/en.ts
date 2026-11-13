export const en = {
  players: "Players",
  games: "Games",
  timeline: "Timeline",
  induction: "Induction",
  resources: "Resources",
  about: "About",
  menu: "Menu",
  close: "Close",
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
  language: "Language",
  aboutEyebrow: "About the project",
  aboutTitle: "About Go | Hall of Fame",
  aboutIntro:
    "Go | Hall of Fame honors the game of Go: its legendary players, its legendary games and the history that connects them. It is an open-source project, built in the open.",
  contributors: "Contributors",
  contributorsIntro: "The people who made this site.",
  roleCreator: "Creator and maintainer",
  roleAssistant: "AI pair programmer",
  homeTitle:
    "The works of art and the legendary players in the history of Go.",
  homeIntro:
    "The iconic masterpieces and the artists who made their mark in the most complex game of all.",
} as const

export type Messages = {
  readonly [K in keyof typeof en]: string
}
