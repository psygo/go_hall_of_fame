"use server"

import { contributorsAdminState } from "@/config/di"

import type { ContributorFormState } from "./contributors-admin-state"

export async function saveContributorAction(
  slugParam: string,
  _previous: ContributorFormState,
  formData: FormData,
): Promise<ContributorFormState> {
  return contributorsAdminState.saveFromForm(
    slugParam,
    formData,
  )
}

export async function deleteContributorAction(
  slug: string,
): Promise<void> {
  return contributorsAdminState.deleteBySlug(slug)
}
