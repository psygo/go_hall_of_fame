import type { PasswordEncoder } from "../../domain/repositories/password-encoder"
import type { PasswordHasher } from "../data-sources/password-hasher"

export class PasswordEncoderImpl implements PasswordEncoder {
  constructor(private readonly hasher: PasswordHasher) {}

  hash(password: string) {
    return this.hasher.hash(password)
  }
}
