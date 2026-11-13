import Image from "next/image"

const PLACEHOLDER_PORTRAIT_URL =
  "/images/placeholder-portrait.jpg"

type PortraitProps = {
  readonly photoUrl: string | null
  readonly position: string
  readonly sizes: string
  readonly className?: string
  /** "contain" shows a whole logo instead of cropping it. */
  readonly fit?: "cover" | "contain"
}

export function Portrait({
  photoUrl,
  position,
  sizes,
  className = "",
  fit = "cover",
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
        className={
          fit === "cover"
            ? "object-cover"
            : "bg-white object-contain p-6"
        }
        style={{ objectPosition: position }}
      />
    </div>
  )
}
