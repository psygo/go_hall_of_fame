import { contentLoaders, inductionState } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import { NominationForm } from "../components/nomination-form"

export async function InductionScreen() {
  const [criteria, texts] = await Promise.all([
    inductionState.loadCriteria(),
    contentLoaders.loadPageTexts("induction"),
  ])

  return (
    <>
      <PageHeader
        eyebrow={texts["induction.eyebrow"]}
        title={texts["induction.title"]}
      />
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        <div className="min-[720px]:border-divider min-[720px]:border-r">
          {criteria.map((criterion) => (
            <div
              key={criterion.position}
              className="border-divider grid grid-cols-[48px_1fr] gap-4 border-b px-4 py-5"
            >
              <div className="text-accent text-[28px] font-bold">
                {String(criterion.position).padStart(
                  2,
                  "0",
                )}
              </div>
              <div>
                <div className="text-xl font-bold">
                  {criterion.title}
                </div>
                <div className="mt-1 max-w-[50ch]">
                  {criterion.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pt-8 pb-12">
          <NominationForm
            title={texts["induction.formTitle"]}
          />
        </div>
      </section>
    </>
  )
}
