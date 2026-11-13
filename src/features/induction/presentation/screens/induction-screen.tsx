import { contentLoaders, inductionState } from "@/config/di"
import { ListControls } from "@/shared/ui/presentation/list-controls"
import { Pagination } from "@/shared/ui/presentation/pagination"
import { PageHeader } from "@/shared/ui/presentation/page-header"

import {
  CRITERIA_ORDER_LABELS,
  CRITERIA_ORDERS,
} from "../../domain/entities/criterion"
import type { CriteriaSearchParams } from "../state/induction-state"
import { NominationForm } from "../components/nomination-form"

type InductionScreenProps = {
  readonly searchParams: Promise<CriteriaSearchParams>
}

export async function InductionScreen({
  searchParams,
}: InductionScreenProps) {
  const params = await searchParams
  const [{ criteria, order }, texts] = await Promise.all([
    inductionState.loadCriteriaPage(params),
    contentLoaders.loadPageTexts("induction"),
  ])

  return (
    <>
      <PageHeader
        eyebrow={texts["induction.eyebrow"]}
        title={texts["induction.title"]}
      >
        <ListControls
          sort={{
            value: order,
            options: CRITERIA_ORDERS.map((value) => ({
              value,
              label: CRITERIA_ORDER_LABELS[value],
            })),
          }}
        />
      </PageHeader>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        <div className="min-[720px]:border-divider min-[720px]:border-r">
          {criteria.items.map((criterion) => (
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
          <Pagination
            page={criteria.page}
            pageCount={criteria.pageCount}
            basePath="/induction"
            params={{
              sort: order === "first" ? "" : order,
            }}
          />
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
