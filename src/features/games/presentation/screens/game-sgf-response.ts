import { gamesLoaders } from "@/config/di"

type SgfRouteContext = {
  readonly params: Promise<{ readonly slug: string }>
}

/** Serves the SGF text uploaded for a game, so the board can load it like any other SGF URL. */
export async function respondWithGameSgf(
  _request: Request,
  { params }: SgfRouteContext,
): Promise<Response> {
  const { slug } = await params
  const text = await gamesLoaders.loadGameSgf(slug)
  if (text === null) {
    return new Response("Not found", { status: 404 })
  }
  return new Response(text, {
    headers: {
      // text/plain + nosniff: the file is only ever data for the board, never a page.
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
      "content-security-policy":
        "default-src 'none'; sandbox",
      "cache-control":
        "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
