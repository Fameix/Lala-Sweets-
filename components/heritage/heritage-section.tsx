import { cn } from "@/lib/utils"

/**
 * Layout primitive shared by every heritage-page section: background tone +
 * subtle paper-grain texture. Not itself one of the named content sections
 * (HeritageHero, StorySection, etc.) - those are built on top of this.
 */
export function SectionShell({
  children,
  tone = "parchment",
  className,
}: {
  children: React.ReactNode
  tone?: "parchment" | "ivory" | "maroon"
  className?: string
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-primary/10",
        tone === "parchment" ? "bg-[oklch(0.96_0.028_78)]" : tone === "maroon" ? "bg-primary" : "bg-background",
        tone === "maroon" && "border-transparent",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
          mixBlendMode: tone === "maroon" ? "overlay" : "multiply",
        }}
        aria-hidden="true"
      />
      <div className="relative">{children}</div>
    </section>
  )
}

export function SectionEyebrow({ tone = "default", children }: { tone?: "default" | "gold"; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.34em]",
        tone === "gold" ? "text-accent" : "text-primary/70",
      )}
    >
      {children}
    </p>
  )
}
