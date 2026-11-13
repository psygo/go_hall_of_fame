import { inductionAdminState } from "@/config/di"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { CriterionForm } from "../components/criterion-form"

type AdminCriterionEditorScreenProps = {
  readonly params: Promise<{ readonly id: string }>
}

export async function AdminCriterionEditorScreen({
  params,
}: AdminCriterionEditorScreenProps) {
  const { id } = await params
  const criterion =
    await inductionAdminState.loadCriterionEditor(id)

  return (
    <>
      <PageHeader
        eyebrow="Admin · Criteria"
        title={
          criterion === null
            ? "New criterion"
            : criterion.title
        }
      />
      <AdminSection>
        <CriterionForm
          idParam={id}
          initial={{
            position:
              criterion === null
                ? ""
                : String(criterion.position),
            title: criterion?.title ?? "",
            text: criterion?.text ?? "",
          }}
        />
      </AdminSection>
    </>
  )
}
