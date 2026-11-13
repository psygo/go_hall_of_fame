import { captureDataState } from "@/core/data-state"

import type {
  NewSession,
  SessionLookup,
  SessionsRepository,
} from "../../domain/repositories/sessions-repository"
import type { SessionsDataSource } from "../data-sources/sessions-data-source"

export class SessionsRepositoryImpl implements SessionsRepository {
  constructor(
    private readonly dataSource: SessionsDataSource,
  ) {}

  create(session: NewSession) {
    return captureDataState(() =>
      this.dataSource.insert(session),
    )
  }

  findAdminByToken(lookup: SessionLookup) {
    return captureDataState(async () => {
      const model =
        await this.dataSource.fetchAdminByToken(lookup)
      return model === null ? null : model.toEntity()
    })
  }

  delete(token: string) {
    return captureDataState(() =>
      this.dataSource.delete(token),
    )
  }
}
