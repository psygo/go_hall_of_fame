import {
  validateResourceRows,
  type ResourceRow,
} from "@/core/resources"
import type {
  FieldErrors,
  Validation,
} from "@/core/validation"

import type { ResourceLink } from "@/core/resources"

export const RESOURCES_PAGE_SIZE = 15

/** What the admin form submits. */
export type SiteResourcesForm = {
  readonly resources: readonly ResourceRow[]
}

export type SiteResourcesErrors = FieldErrors

export function validateSiteResourcesForm(
  form: SiteResourcesForm,
): Validation<
  readonly ResourceLink[],
  SiteResourcesErrors
> {
  const result = validateResourceRows(form.resources)
  return result.valid
    ? { valid: true, draft: result.links }
    : { valid: false, errors: { resources: result.error } }
}
