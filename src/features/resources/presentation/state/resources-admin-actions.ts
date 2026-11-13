"use server"

import { resourcesAdminState } from "@/config/di"

import type { ResourcesFormState } from "./resources-admin-state"

export async function saveResourcesAction(
  _previous: ResourcesFormState,
  formData: FormData,
): Promise<ResourcesFormState> {
  return resourcesAdminState.saveFromForm(formData)
}
