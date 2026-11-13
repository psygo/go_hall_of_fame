import type { gamesTable } from "../../src/shared/database/data/schema"

type GameSeed = Omit<
  typeof gamesTable.$inferInsert,
  "id" | "createdAt"
> & { readonly playerSlugs: readonly string[] }

// Facts were written from memory in the design handoff and need verification.
export const gameSeeds: readonly GameSeed[] = [
  {
    slug: "blood-vomiting-game",
    year: 1835,
    name: "The Blood-Vomiting Game",
    black: "Akaboshi Intetsu",
    white: "Honinbo Jowa",
    result: "Black by 2",
    setting: "Edo, Japan",
    description:
      "The young Intetsu faced the reigning Honinbo in a match that cost him his health and, within months, his life.\n\nIntetsu’s unexpected moves were said to be placed by ghosts, and they turned a game Jowa was winning. Intetsu coughed blood during play and finished the game.\n\nIntetsu won, then died of illness within about two months. The game became the founding legend of sacrifice in Go.",
    playerSlugs: [],
  },
  {
    slug: "ear-reddening-game",
    year: 1846,
    name: "The Ear-Reddening Game",
    black: "Honinbo Shusaku",
    white: "Gennan Inseki",
    result: "Black by 2",
    setting: "Edo castle games",
    description:
      "A teenage Shusaku beat the powerful Inseki with a single move that no master at the table had seen.\n\nBlack’s move 127 stunned the room. A doctor watching the game reportedly saw Inseki’s ears turn red, a sign that he knew the game had slipped away.\n\nThe move is still taught as an example of a quiet, deep shape that changes the evaluation of the whole board.",
    playerSlugs: ["honinbo-shusaku"],
  },
  {
    slug: "game-of-the-century",
    year: 1933,
    name: "The Game of the Century",
    black: "Go Seigen",
    white: "Honinbo Shusai",
    result: "White by 2",
    setting: "Tokyo, Japan",
    description:
      "The young challenger played the unthinkable against the reigning Honinbo Shusai: he opened in the corner, on the star point, and then on tengen.\n\nBlack’s third move at the centre of the board shocked a tradition that had long prized the corners. The match was suspended and resumed over weeks.\n\nShusai won, but the opening started the New Fuseki revolution that Go Seigen and Kitani Minoru carried forward.",
    playerSlugs: ["go-seigen"],
  },
  {
    slug: "alphago-game-2",
    year: 2016,
    sequence: 1,
    name: "AlphaGo — Game 2",
    black: "AlphaGo",
    white: "Lee Sedol",
    result: "Black by resignation",
    setting: "Seoul, Korea",
    description:
      "In the second game of the Google DeepMind Challenge Match, a program played a move professionals took for a mistake.\n\nMove 37 was a shoulder hit on the fifth line. Commentators first thought it was an error; Lee Sedol left the room for several minutes.\n\nIt opened the age of AI in Go and showed that centuries of conventional judgement had blind spots.",
    playerSlugs: ["lee-sedol"],
  },
  {
    slug: "alphago-game-4",
    year: 2016,
    sequence: 2,
    name: "AlphaGo — Game 4",
    black: "AlphaGo",
    white: "Lee Sedol",
    result: "White by resignation",
    setting: "Seoul, Korea",
    description:
      "Down 0–3 in a five-game match, Lee Sedol played the move that no one including the machine had on the board.\n\nWhite’s move 78, a wedge in the middle, is known as the God’s Touch. AlphaGo misjudged its value and its play deteriorated.\n\nThe only game a human has won against AlphaGo in a match. It is still the most celebrated moment in the human game.",
    featured: true,
    playerSlugs: ["lee-sedol"],
  },
]
