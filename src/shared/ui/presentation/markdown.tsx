import Link from "next/link"
import ReactMarkdown from "react-markdown"

// Prose only: no raw HTML (react-markdown ignores it), no images, no headings bigger than a label.
const ALLOWED_ELEMENTS = [
  "p",
  "strong",
  "em",
  "del",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "br",
]

type MarkdownProps = {
  readonly children: string
  readonly className?: string
}

/** Renders the Markdown an admin typed: paragraphs, emphasis, lists, quotes and links. */
export function Markdown({
  children,
  className = "",
}: MarkdownProps) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown
        allowedElements={ALLOWED_ELEMENTS}
        unwrapDisallowed
        urlTransform={allowLink}
        components={{ a: MarkdownLink }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

function MarkdownLink({
  href,
  children,
}: {
  readonly href?: string
  readonly children?: React.ReactNode
}) {
  if (href === undefined) return <>{children}</>
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href}>{children}</Link>
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {children}
    </a>
  )
}

/** Links are a path on this site, an anchor or https: no http, mailto, javascript: or data:. */
function allowLink(url: string): string {
  const isSitePath =
    url.startsWith("/") && !url.startsWith("//")
  return isSitePath ||
    url.startsWith("#") ||
    url.startsWith("https://")
    ? url
    : ""
}
