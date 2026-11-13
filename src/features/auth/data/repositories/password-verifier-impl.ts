import type { PasswordVerifier } from "../../domain/repositories/password-verifier"
import type { PasswordHasher } from "../data-sources/password-hasher"

export class PasswordVerifierImpl implements PasswordVerifier {
  constructor(private readonly hasher: PasswordHasher) {}

  verify(password: string, hash: string | null) {
    return this.hasher.verify(password, hash)
  }
}
