import Image from "next/image"

const PLACEHOLDER_PORTRAIT_URL =
  "/images/placeholder-portrait.jpg"

type PortraitProps = {
  readonly photoUrl: string | null
  readonly position: string
  readonly sizes: string
  readonly className?: string
}

export function Portrait({
  photoUrl,
  position,
  sizes,
  className = "",
}: PortraitProps) {
  return (
    <div
      className={`photo-frame relative aspect-[4/5] overflow-hidden ${className}`}
    >
      <Image
        src={photoUrl ?? PLACEHOLDER_PORTRAIT_URL}
        alt=""
        fill
        sizes={sizes}
        className="photo-ink object-cover"
        style={{ objectPosition: position }}
      />
    </div>
  )
}
