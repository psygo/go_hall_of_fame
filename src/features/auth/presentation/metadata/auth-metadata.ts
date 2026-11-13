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

export const forgotPasswordMetadata: Metadata = {
  title: "Forgot your password?",
  robots: keepOutOfSearch,
}

/** The address carries a secret token, so the page must not pass it on in a Referer header. */
export const resetPasswordMetadata: Metadata = {
  title: "Choose a new password",
  robots: keepOutOfSearch,
  referrer: "no-referrer",
}
