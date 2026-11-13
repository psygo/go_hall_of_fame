import type { Metadata } from "next"

import { resolveSiteUrl } from "@/core/site-url"

const SITE_NAME = "Go | Hall of Fame"
const DESCRIPTION =
  "The finest hands in the history of Go: legendary players and legendary games, from the Edo castle matches to AlphaGo in Seoul."

/** The public address, which makes the share-preview image links absolute. */
function readSiteUrl(): URL {
  const address =
    resolveSiteUrl(process.env, false) ??
    "http://localhost:3000"
  return new URL(address)
}

export const siteMetadata: Metadata = {
  metadataBase: readSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
}

/** A page's title and description, repeated for link previews (the image comes from its opengraph-image). */
export function pageMetadata({
  title,
  description,
}: {
  readonly title: string
  readonly description: string
}): Metadata {
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}
