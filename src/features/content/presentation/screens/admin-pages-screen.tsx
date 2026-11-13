import { contentAdminState } from "@/config/di"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { SiteTextsForm } from "../components/site-texts-form"

type AdminPagesScreenProps = {
  readonly searchParams: Promise<{
    readonly saved?: string
  }>
}

export async function AdminPagesScreen({
  searchParams,
}: AdminPagesScreenProps) {
  const { saved } = await searchParams
  const texts = await contentAdminState.loadEditableTexts()

  return (
    <>
      <PageHeader eyebrow="Admin" title="Page texts" />
      <AdminSection>
        {saved === "1" && (
          <p
            role="status"
            className="tag tag-accent mb-6 self-start"
          >
            Saved. The public pages now show these texts.
          </p>
        )}
        <SiteTextsForm texts={texts} />
      </AdminSection>
    </>
  )
}
