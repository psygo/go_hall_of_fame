"use server"

import { timelineAdminState } from "@/config/di"

import type { TimelineFormState } from "./timeline-admin-state"

export async function saveTimelineEventAction(
  idParam: string,
  _previous: TimelineFormState,
  formData: FormData,
): Promise<TimelineFormState> {
  return timelineAdminState.saveFromForm(idParam, formData)
}

export async function deleteTimelineEventAction(
  id: number,
): Promise<void> {
  return timelineAdminState.deleteById(id)
}
