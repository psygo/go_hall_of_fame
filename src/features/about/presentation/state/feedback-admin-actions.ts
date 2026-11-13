"use server"

import { feedbackAdminState } from "@/config/di"

export async function setFeedbackReadAction(
  id: number,
  isRead: boolean,
): Promise<void> {
  return feedbackAdminState.setRead(id, isRead)
}

export async function deleteFeedbackAction(
  id: number,
): Promise<void> {
  return feedbackAdminState.deleteById(id)
}
