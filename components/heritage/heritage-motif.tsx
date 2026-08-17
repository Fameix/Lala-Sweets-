import { cn } from "@/lib/utils"

/** Thin line-art South Indian temple pillar, used as a decorative editorial motif. */
export function PillarMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 420"
      fill="none"
      className={cn("text-primary/25", className)}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.2">
        <path d="M20 20 H100 M28 30 H92 M20 20 L28 30 M100 20 L92 30" />
        <path d="M36 30 V56 M84 30 V56" />
        <path d="M30 56 H90 M30 62 H90" />
        <ellipse cx="60" cy="90" rx="22" ry="10" />
        <path d="M40 90 V320 M80 90 V320" />
        <path d="M40 130 H80 M40 170 H80 M40 210 H80 M40 250 H80 M40 290 H80" strokeDasharray="2 6" />
        <ellipse cx="60" cy="330" rx="22" ry="10" />
        <path d="M28 344 H92 M22 356 H98 M30 344 L22 356 M90 344 L98 356" />
        <path d="M20 400 H100 M28 390 H92" />
      </g>
    </svg>
  )
}

/** Simplified line-art South Indian temple gopuram silhouette, used as a faint editorial backdrop. */
export function TempleMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 320" fill="none" className={cn("text-primary", className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.4">
        <path d="M110 8 L122 26 H98 Z" />
        <path d="M84 26 H136 M80 40 H140 L134 26 H86 Z" />
        <path d="M70 40 L150 40 L144 60 L76 60 Z" />
        <path d="M62 60 L158 60 L150 84 L70 84 Z" />
        <path d="M52 84 L168 84 L158 112 L62 112 Z" />
        <path d="M40 112 L180 112 L168 146 L52 146 Z" />
        <path d="M30 146 H190 V300 H30 Z" />
        <path d="M30 168 H190 M30 190 H190 M30 212 H190 M30 234 H190 M30 256 H190 M30 278 H190" strokeDasharray="1 8" />
        <path d="M92 300 V240 H128 V300" />
        <path d="M0 300 H220" />
      </g>
    </svg>
  )
}

/** Small kolam-inspired dotted diamond motif for corner accents. */
export function KolamMotif({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" className={cn("text-accent/70", className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1">
        <path d="M40 6 L74 40 L40 74 L6 40 Z" strokeOpacity="0.5" />
        <path d="M40 20 L60 40 L40 60 L20 40 Z" strokeOpacity="0.7" />
      </g>
      <g fill="currentColor">
        <circle cx="40" cy="6" r="1.6" />
        <circle cx="74" cy="40" r="1.6" />
        <circle cx="40" cy="74" r="1.6" />
        <circle cx="6" cy="40" r="1.6" />
        <circle cx="40" cy="40" r="1.8" />
      </g>
    </svg>
  )
}
