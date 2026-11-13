"use server"

import { authState } from "@/config/di"

export async function signOutAction(): Promise<void> {
  await authState.signOutCurrent()
}
