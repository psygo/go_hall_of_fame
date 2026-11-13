export interface PasswordVerifier {
  /**
   * Checks a password against a stored hash. Pass null when there is no hash (unknown email): the
   * check still does the same work, so response time does not reveal which emails exist.
   */
  verify(
    password: string,
    hash: string | null,
  ): Promise<boolean>
}
