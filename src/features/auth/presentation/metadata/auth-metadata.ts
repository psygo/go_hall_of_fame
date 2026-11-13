import type { Metadata } from "next"

const keepOutOfSearch: Metadata["robots"] = {
  index: false,
  follow: false,
}

export const signInMetadata: Metadata = {
  title: "Sign in",
  robots: keepOutOfSearch,
}

export const adminMetadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: keepOutOfSearch,
}
