import { captureDataState } from "@/core/data-state"

import type {
  AdminsRepository,
  FailedAttemptRecord,
} from "../../domain/repositories/admins-repository"
import type { AdminsDataSource } from "../data-sources/admins-data-source"

export class AdminsRepositoryImpl implements AdminsRepository {
  constructor(
    private readonly dataSource: AdminsDataSource,
  ) {}

  findCredentialsByEmail(email: string) {
    return captureDataState(async () => {
      const model =
        await this.dataSource.fetchCredentialsByEmail(email)
      return model === null ? null : model.toEntity()
    })
  }

  recordFailedAttempt(record: FailedAttemptRecord) {
    return captureDataState(() =>
      this.dataSource.updateFailedAttempts(record),
    )
  }

  clearFailedAttempts(adminId: number) {
    return captureDataState(() =>
      this.dataSource.updateFailedAttempts({
        adminId,
        failedAttempts: 0,
        lockedUntil: null,
      }),
    )
  }
}
