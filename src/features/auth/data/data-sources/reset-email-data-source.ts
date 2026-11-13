import type { ResetEmail } from "../../domain/repositories/reset-mailer"

export type EmailSettings = {
  /** A Resend API key. Without one, development prints the link and production refuses to send. */
  readonly apiKey: string | null
  /** The From header, for example "Go Hall of Fame <noreply@example.com>". */
  readonly from: string | null
  readonly isProduction: boolean
}

const RESEND_URL = "https://api.resend.com/emails"
const SEND_TIMEOUT_MS = 8_000

/** Sends the reset email through Resend's HTTP API. Throws when it cannot. */
export class ResetEmailDataSource {
  constructor(private readonly settings: EmailSettings) {}

  async send(email: ResetEmail): Promise<void> {
    const { apiKey, from, isProduction } = this.settings
    if (apiKey === null || from === null) {
      if (isProduction) {
        throw new Error("Email is not configured")
      }
      // Development only: with no email service the link is printed so it can be opened by hand.
      console.info(
        `Password reset link for ${email.to}: ${email.link}`,
      )
      return
    }
    const response = await fetch(RESEND_URL, {
      method: "POST",
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: "Reset your Go | Hall of Fame password",
        text: buildBody(email),
      }),
    })
    if (!response.ok) {
      throw new Error(
        `The email service answered ${response.status}`,
      )
    }
  }
}

function buildBody(email: ResetEmail): string {
  return [
    `Hello ${email.name},`,
    "",
    "Someone asked to reset the password of your Go | Hall of Fame admin account.",
    `Choose a new one here (the link works once, for ${email.validForMinutes} minutes):`,
    "",
    email.link,
    "",
    "If you did not ask for this, ignore this email: your password stays as it is.",
  ].join("\n")
}
