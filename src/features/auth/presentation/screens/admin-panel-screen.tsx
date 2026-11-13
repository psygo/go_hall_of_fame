import type { ReactNode } from "react"

import { authState } from "@/config/di"
import { AdminNav } from "@/shared/ui/presentation/admin-nav"

export async function AdminPanelScreen({
  children,
}: {
  readonly children: ReactNode
}) {
  // Layouts are not re-checked on client navigation, so every admin page and action asks again.
  await authState.requireAdmin()

  return (
    <>
      <AdminNav />
      {children}
    </>
  )
}
