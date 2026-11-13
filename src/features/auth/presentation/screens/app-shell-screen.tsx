import type { ReactNode } from "react"

import { authState } from "@/config/di"
import { AppShell } from "@/shared/ui/presentation/app-shell"

import { initialsOf } from "../../domain/entities/admin"
import { signOutAction } from "../state/sign-out-action"

export async function AppShellScreen({
  children,
}: {
  readonly children: ReactNode
}) {
  const admin = await authState.loadCurrentAdmin()

  return (
    <AppShell
      admin={
        admin === null
          ? null
          : {
              name: admin.name,
              email: admin.email,
              initials: initialsOf(admin.name),
            }
      }
      signOut={signOutAction}
    >
      {children}
    </AppShell>
  )
}
