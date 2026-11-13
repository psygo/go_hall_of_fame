"use server"

import { inductionAdminState } from "@/config/di"

import type { CriterionFormState } from "./induction-admin-state"

export async function saveCriterionAction(
  idParam: string,
  _previous: CriterionFormState,
  formData: FormData,
): Promise<CriterionFormState> {
  return inductionAdminState.saveCriterionFromForm(
    idParam,
    formData,
  )
}

export async function deleteCriterionAction(
  id: number,
): Promise<void> {
  return inductionAdminState.deleteCriterionById(id)
}

export async function setNominationStatusAction(
  id: number,
  status: string,
): Promise<void> {
  return inductionAdminState.setNominationStatus(id, status)
}

export async function deleteNominationAction(
  id: number,
): Promise<void> {
  return inductionAdminState.deleteNominationById(id)
}
