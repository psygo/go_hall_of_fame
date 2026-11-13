/**
 * Resolves when the current request comes from a signed-in admin, and never returns otherwise
 * (it redirects to the sign-in page). Every admin read and write calls it, because layouts do not
 * protect Server Actions: those are public endpoints.
 */
export type RequireAdmin = () => Promise<void>
