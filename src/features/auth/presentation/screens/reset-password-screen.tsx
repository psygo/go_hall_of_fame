import Link from "next/link"

import { authState } from "@/config/di"
import {
  readParam,
  type QueryParam,
} from "@/core/list-query"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { ResetPasswordForm } from "../components/reset-password-form"

type ResetPasswordScreenProps = {
  readonly searchParams: Promise<{
    readonly token?: QueryParam
  }>
}

export async function ResetPasswordScreen({
  searchParams,
}: ResetPasswordScreenProps) {
  const token = readParam((await searchParams).token)
  const { isUsable } = await authState.loadResetLink(token)

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Choose a new password"
      />
      <section className="max-w-[480px] px-4 pt-8 pb-12">
        {isUsable ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div role="alert" className="flex flex-col gap-4">
            <p>
              This link has expired or was already used. Ask
              for a new one.
            </p>
            <Link
              href="/admin/forgot-password"
              className="font-bold"
            >
              Send me a new link →
            </Link>
          </div>
        )}
      </section>
    </>
  )
}
