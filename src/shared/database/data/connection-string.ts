const AMBIGUOUS_SSL_MODES = [
  "prefer",
  "require",
  "verify-ca",
]

/**
 * `pg` treats sslmode=prefer, require and verify-ca as verify-full, and warns that a future version
 * will change that. Naming verify-full says what happens today (the certificate and the host name
 * are checked) and keeps the warning out of the logs. Other values, and strings that are not URLs,
 * are returned as they are.
 */
export function withExplicitSslMode(
  connectionString: string,
): string {
  if (!URL.canParse(connectionString))
    return connectionString
  const url = new URL(connectionString)
  const mode = url.searchParams.get("sslmode")
  if (
    mode === null ||
    !AMBIGUOUS_SSL_MODES.includes(mode)
  ) {
    return connectionString
  }
  url.searchParams.set("sslmode", "verify-full")
  return url.toString()
}
