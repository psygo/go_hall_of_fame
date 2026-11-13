import { redirect } from "next/navigation"

import { authState } from "@/config/di"
import {
  readParam,
  type QueryParam,
} from "@/core/list-query"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { SignInForm } from "../components/sign-in-form"
import { ADMIN_HOME_PATH } from "../state/auth-state"

type SignInScreenProps = {
  readonly searchParams: Promise<{
    readonly reset?: QueryParam
  }>
}

export async function SignInScreen({
  searchParams,
}: SignInScreenProps) {
  const admin = await authState.loadCurrentAdmin()
  if (admin !== null) redirect(ADMIN_HOME_PATH)

  const hasJustReset =
    readParam((await searchParams).reset) === "done"

  return (
    <>
      <PageHeader eyebrow="Admin" title="Sign in" />
      <section className="max-w-[480px] px-4 pt-8 pb-12">
        {hasJustReset && (
          <p role="status" className="mb-6 font-bold">
            Your password was changed. Sign in with the new
            one.
          </p>
        )}
        <SignInForm />
      </section>
    </>
  )
}
