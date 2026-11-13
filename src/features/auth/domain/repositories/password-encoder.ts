export interface PasswordEncoder {
  /** The stored form of a new password (salted and slow to compute). */
  hash(password: string): Promise<string>
}
