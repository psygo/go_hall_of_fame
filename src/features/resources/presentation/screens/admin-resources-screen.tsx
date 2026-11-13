import { resourcesAdminState } from "@/config/di"
import { AdminSection } from "@/shared/ui/presentation/admin-section"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { SiteResourcesForm } from "../components/site-resources-form"

export async function AdminResourcesScreen() {
  const resources = await resourcesAdminState.loadEditor()

  return (
    <>
      <PageHeader eyebrow="Admin" title="Resources" />
      <AdminSection>
        <SiteResourcesForm
          initial={resources.map((resource) => ({
            title: resource.title,
                url: resource.url,
            description: resource.description ?? "",
          }))}
        />
      </AdminSection>
    </>
  )
}
