import { captureDataState } from "@/core/data-state"

import type {
  ResetEmail,
  ResetMailer,
} from "../../domain/repositories/reset-mailer"
import type { ResetEmailDataSource } from "../data-sources/reset-email-data-source"

export class ResetMailerImpl implements ResetMailer {
  constructor(
    private readonly dataSource: ResetEmailDataSource,
  ) {}

  send(email: ResetEmail) {
    return captureDataState(() =>
      this.dataSource.send(email),
    )
  }
}
