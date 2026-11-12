import { timelineLoaders } from "@/config/di"
import { PageHeader } from "@/shared/ui/presentation/page-header"

export async function TimelineScreen() {
  const events = await timelineLoaders.loadTimeline()

  return (
    <>
      <PageHeader
        eyebrow="Four centuries"
        title="Timeline"
      />
      {events.map((event) => (
        <section
          key={`${event.year}-${event.title}`}
          className="border-divider grid grid-cols-[96px_1fr] border-b min-[720px]:grid-cols-[minmax(110px,200px)_1fr]"
        >
          <div className="border-divider text-accent border-r px-4 py-6 text-[26px] leading-none font-bold min-[720px]:text-[clamp(28px,4vw,48px)]">
            {event.year}
          </div>
          <div className="flex flex-col gap-1.5 px-4 py-6">
            <div className="text-[22px] font-bold">
              {event.title}
            </div>
            <div className="max-w-[60ch]">{event.text}</div>
          </div>
        </section>
      ))}
    </>
  )
}
