import Image from "next/image"

import { cn } from "@/lib/utils"

export type HeritageTimelineEntry = {
  year: string
  title: string
  text: string
  /** Optional circular photo for this milestone. Falls back to a plain gold ring when omitted, rather than inventing a period photograph that doesn't exist. */
  imageSrc?: string
}

export function HeritageTimeline({ entries }: { entries: HeritageTimelineEntry[] }) {
  return (
    <div className="relative">
      <div
        className="absolute left-[27px] top-6 bottom-6 w-px bg-[repeating-linear-gradient(180deg,var(--color-accent)_0,var(--color-accent)_4px,transparent_4px,transparent_10px)] sm:left-0 sm:right-0 sm:top-6 sm:h-px sm:w-auto sm:bg-[repeating-linear-gradient(90deg,var(--color-accent)_0,var(--color-accent)_4px,transparent_4px,transparent_10px)]"
        aria-hidden="true"
      />

      <ol className="relative grid gap-10 sm:grid-cols-5 sm:gap-4">
        {entries.map((entry) => (
          <li key={entry.year + entry.title} className="relative flex gap-4 pl-[3.75rem] text-left sm:flex-col sm:items-center sm:gap-0 sm:pl-0 sm:text-center">
            <div className="absolute left-0 top-0 sm:static sm:mb-4">
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent bg-card shadow-[0_8px_20px_rgba(61,25,15,0.18)]">
                {entry.imageSrc ? (
                  <Image src={entry.imageSrc} alt={entry.title} fill sizes="56px" className="object-cover" />
                ) : (
                  <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
                )}
              </div>
            </div>

            <div>
              {entry.year ? (
                <p className="font-heading text-2xl font-semibold leading-none text-primary sm:text-3xl">{entry.year}</p>
              ) : null}
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/60 sm:text-xs", entry.year && "mt-2")}>
                {entry.title}
              </p>
              <p className="mt-2 max-w-[14rem] text-sm leading-6 text-muted-foreground sm:mx-auto">{entry.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
