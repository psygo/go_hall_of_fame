import Link from "next/link"

type BackLinkProps = {
  readonly href: string
  readonly children: string
}

export function BackLink({
  href,
  children,
}: BackLinkProps) {
  return (
    <section className="border-divider border-b px-4 py-5 text-[13px]">
      <Link href={href}>← {children}</Link>
    </section>
  )
}
