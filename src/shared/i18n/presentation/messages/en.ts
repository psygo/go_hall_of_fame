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
    "Go | Hall of Fame honors the game of Go: its legendary players, its legendary games and the history that connects them. This is an open-source project.",
  contributors: "Contributors",
  builtBy: "Built and maintained by",
  contributorsIntro:
    "The people who make this website possible",
  roleCreator: "Creator and maintainer",
  homeTitle:
    "The works of art and the legendary players in the history of Go.",
  homeIntro:
    "The iconic masterpieces and the artists who made their mark in the most complex game of all.",
  feedbackTitle: "Send us feedback",
  feedbackEmail: "Your email",
  feedbackDescription: "Description",
  feedbackSend: "Send feedback",
  feedbackSending: "Sending…",
  feedbackThanks: "Thank you.",
  feedbackSent: "Your feedback was sent.",
  feedbackAnother: "Send more feedback",
} as const

export type Messages = {
  readonly [K in keyof typeof en]: string
}
