import { redirect } from "next/navigation"

import { authState } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { SignInForm } from "../components/sign-in-form"
import { ADMIN_HOME_PATH } from "../state/auth-state"

export async function SignInScreen() {
  const admin = await authState.loadCurrentAdmin()
  if (admin !== null) redirect(ADMIN_HOME_PATH)

  return (
    <>
      <PageHeader eyebrow="Admin" title="Sign in" />
      <section className="max-w-[480px] px-4 pt-8 pb-12">
        <SignInForm />
      </section>
    </>
  )
}
