import { captureDataState } from "@/core/data-state"

import type {
  NewPasswordReset,
  PasswordResetCompletion,
  PasswordResetsRepository,
} from "../../domain/repositories/password-resets-repository"
import type { PasswordResetsDataSource } from "../data-sources/password-resets-data-source"

export class PasswordResetsRepositoryImpl implements PasswordResetsRepository {
  constructor(
    private readonly dataSource: PasswordResetsDataSource,
  ) {}

  create(reset: NewPasswordReset) {
    return captureDataState(() =>
      this.dataSource.insert(reset),
    )
  }

  findByToken(token: string) {
    return captureDataState(async () => {
      const model =
        await this.dataSource.fetchByToken(token)
      return model === null ? null : model.toEntity()
    })
  }

  complete(completion: PasswordResetCompletion) {
    return captureDataState(() =>
      this.dataSource.complete(completion),
    )
  }
}
