const GRID_LINES = Array.from(
  { length: 19 },
  (_, i) => 20 + i * 20,
)
const STAR_POINTS = [80, 200, 320].flatMap((x) =>
  [80, 200, 320]
    .filter((y) => !(x === 200 && y === 200))
    .map((y) => [x, y]),
)

type Stone = {
  readonly x: number
  readonly y: number
  readonly color: "black" | "white" | "accent"
}

const STONES: readonly Stone[] = [
  { x: 300, y: 80, color: "black" },
  { x: 320, y: 100, color: "white" },
  { x: 280, y: 100, color: "black" },
  { x: 300, y: 120, color: "white" },
  { x: 260, y: 120, color: "black" },
  { x: 100, y: 320, color: "white" },
  { x: 80, y: 300, color: "black" },
  { x: 120, y: 300, color: "black" },
  { x: 100, y: 280, color: "white" },
  { x: 160, y: 200, color: "white" },
  { x: 240, y: 220, color: "black" },
  { x: 180, y: 240, color: "black" },
  { x: 220, y: 180, color: "white" },
  { x: 200, y: 200, color: "accent" },
  { x: 140, y: 140, color: "black" },
  { x: 160, y: 160, color: "white" },
]

const STONE_FILL = {
  black: "var(--stone-black)",
  white: "var(--stone)",
  accent: "var(--accent)",
} as const

export function HeroBoard() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="block w-full max-w-[340px]"
      role="img"
      aria-label="A Go board with a game in progress"
    >
      <g fill="none" stroke="var(--ink)" strokeWidth="1">
        {GRID_LINES.map((line) => (
          <path
            key={line}
            d={`M${line} 20V380M20 ${line}H380`}
          />
        ))}
      </g>
      <rect
        x="20"
        y="20"
        width="360"
        height="360"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <g fill="var(--ink)">
        {STAR_POINTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
        ))}
      </g>
      <g strokeWidth="2" stroke="var(--ink)">
        {STONES.map(({ x, y, color }) => (
          <circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r="9"
            fill={STONE_FILL[color]}
            stroke={
              color === "accent"
                ? "var(--accent)"
                : "var(--ink)"
            }
          />
        ))}
      </g>
    </svg>
  )
}
