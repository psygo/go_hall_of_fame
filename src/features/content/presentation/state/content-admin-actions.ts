"use server"

import { contentAdminState } from "@/config/di"

import type { SiteTextsFormState } from "./content-admin-state"

export async function saveSiteTextsAction(
  _previous: SiteTextsFormState,
  formData: FormData,
): Promise<SiteTextsFormState> {
  return contentAdminState.saveFromForm(formData)
}
