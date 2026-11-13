import { redirect } from "next/navigation"

import { authState } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { ForgotPasswordForm } from "../components/forgot-password-form"
import { ADMIN_HOME_PATH } from "../state/auth-state"

export async function ForgotPasswordScreen() {
  const admin = await authState.loadCurrentAdmin()
  if (admin !== null) redirect(ADMIN_HOME_PATH)

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Forgot your password?"
      />
      <section className="max-w-[480px] px-4 pt-8 pb-12">
        <p className="mb-6">
          Enter the email of your admin account and we will
          send a link to choose a new password.
        </p>
        <ForgotPasswordForm />
      </section>
    </>
  )
}
