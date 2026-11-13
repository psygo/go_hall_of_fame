type Env = Readonly<Record<string, string | undefined>>

/**
 * The public address of the site (no trailing slash): SITE_URL, else the production host that
 * Vercel provides, else localhost outside production, else null. A malformed SITE_URL is ignored.
 */
export function resolveSiteUrl(
  env: Env,
  isProduction: boolean,
): string | null {
  const explicit = env.SITE_URL?.trim().replace(/\/+$/, "")
  if (explicit && isUrl(explicit)) return explicit
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelHost) return `https://${vercelHost}`
  return isProduction ? null : "http://localhost:3000"
}

function isUrl(text: string): boolean {
  return URL.canParse(text)
}
