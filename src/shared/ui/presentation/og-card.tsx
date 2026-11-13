import { ImageResponse } from "next/og"

import { LOGO_DATA_URI } from "./logo-data"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = "image/png"

const PAPER = "#f1e9d6"
const INK = "#1c1a17"
const SEAL = "#c1321e"

type OgCardProps = {
  /** The small line above the title, such as "Legendary player". */
  readonly eyebrow: string
  readonly title: string
  /** One or two lines under the title. */
  readonly description?: string
}

const MAX_DESCRIPTION_LENGTH = 150

function titleSize(title: string): number {
  if (title.length > 48) return 64
  return title.length > 26 ? 84 : 104
}

function shorten(text: string): string {
  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
    : text
}

/** The share-preview card (Open Graph and Twitter): the seal, the site name, a title and a line. */
export function renderOgCard({
  eyebrow,
  title,
  description,
}: OgCardProps): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: PAPER,
        color: INK,
        padding: "64px 80px 72px",
        borderBottom: `16px solid ${SEAL}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          fontSize: 34,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img tags */}
        <img
          src={LOGO_DATA_URI}
          width={88}
          height={88}
          alt=""
        />
        Go | Hall of Fame
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: SEAL,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: titleSize(title),
            lineHeight: 1.02,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
        {description !== undefined && (
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.3,
              opacity: 0.75,
            }}
          >
            {shorten(description)}
          </div>
        )}
      </div>
    </div>,
    OG_SIZE,
  )
}
