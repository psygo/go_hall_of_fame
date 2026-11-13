/** Admin addresses, in a module with no server-only imports so client forms can use them. */
export const ADMIN_PATHS = {
  timeline: "/admin/timeline",
  players: "/admin/players",
  games: "/admin/games",
  criteria: "/admin/criteria",
  nominations: "/admin/nominations",
  feedback: "/admin/feedback",
  pages: "/admin/pages",
  resources: "/admin/resources",
} as const
