import { contributorsAdminState } from "@/config/di"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { DEFAULT_PHOTO_POSITION } from "../../domain/entities/contributor-draft"
import { ContributorForm } from "../components/contributor-form"

type AdminContributorEditorScreenProps = {
  readonly params: Promise<{ readonly slug: string }>
}

export async function AdminContributorEditorScreen({
  params,
}: AdminContributorEditorScreenProps) {
  const { slug } = await params
  const contributor =
    await contributorsAdminState.loadEditor(slug)

  return (
    <>
      <PageHeader
        eyebrow="Admin · Contributors"
        title={
          contributor === null
            ? "New contributor"
            : contributor.name
        }
      />
      <AdminSection>
        <ContributorForm
          slugParam={slug}
          initial={{
            slug: contributor?.slug ?? "",
            name: contributor?.name ?? "",
            kind: contributor?.kind ?? "person",
            role: contributor?.role ?? "",
            period: contributor?.period ?? "",
            bio: contributor?.bio ?? "",
            photoUrl: contributor?.photoUrl ?? "",
            photoPosition:
              contributor?.photoPosition ??
              DEFAULT_PHOTO_POSITION,
            isDraft: contributor?.isDraft ?? false,
          }}
        />
      </AdminSection>
    </>
  )
}
