import Link from "next/link"

export function NotFoundScreen() {
  return (
    <section className="flex flex-col items-start gap-4 px-4 py-16">
      <div className="font-mono text-xs tracking-[0.12em] uppercase">
        404
      </div>
      <h1 className="text-5xl leading-none">
        No such entry in the Hall.
      </h1>
      <p className="max-w-[44ch]">
        The player or game you are looking for is not
        recorded here.
      </p>
      <Link href="/" className="btn btn-primary">
        Back to the Hall
      </Link>
    </section>
  )
}
