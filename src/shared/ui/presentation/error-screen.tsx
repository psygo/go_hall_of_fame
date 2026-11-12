"use client"

type ErrorScreenProps = {
  readonly unstable_retry: () => void
}

export function ErrorScreen({
  unstable_retry,
}: ErrorScreenProps) {
  return (
    <section className="flex flex-col items-start gap-4 px-4 py-16">
      <div className="text-xs tracking-[0.12em] uppercase">
        Error
      </div>
      <h1 className="text-5xl leading-none font-extrabold">
        The board went blank.
      </h1>
      <p className="max-w-[44ch]">
        Something failed while loading this page. Try again
        in a moment.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={unstable_retry}
      >
        Try again
      </button>
    </section>
  )
}
