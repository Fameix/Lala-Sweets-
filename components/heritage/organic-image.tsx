import Image from "next/image"

import { cn } from "@/lib/utils"

const BLOB_SHAPES = {
  a: "63% 37% 54% 46% / 43% 37% 63% 57%",
  b: "42% 58% 63% 37% / 51% 44% 56% 49%",
  c: "58% 42% 39% 61% / 46% 60% 40% 54%",
} as const

type ImageShape = keyof typeof BLOB_SHAPES | "rect"

export function OrganicImage({
  src,
  alt,
  shape = "a",
  priority,
  sizes = "(min-width: 1024px) 45vw, 100vw",
  caption,
  tone = "light",
  className,
}: {
  src: string
  alt: string
  shape?: ImageShape
  priority?: boolean
  sizes?: string
  caption?: string
  /** Use "dark" when placing this on a maroon/dark section so the caption stays legible. */
  tone?: "light" | "dark"
  className?: string
}) {
  // "rect" opts out of the organic blob mask entirely - a plain rounded
  // rectangle at the same widescreen ratio as the homepage hero banner,
  // for sections that should read as a straightforward banner photo rather
  // than the decorative heritage-page blob shapes.
  const isRect = shape === "rect"

  return (
    <div className={cn("relative isolate", className)}>
      {!isRect ? (
        <div
          className="absolute -inset-4 -z-10 border border-accent/40 bg-accent/10 sm:-inset-6"
          style={{ borderRadius: BLOB_SHAPES[shape === "a" ? "b" : shape === "b" ? "c" : "a"] }}
          aria-hidden="true"
        />
      ) : null}
      <div
        className={cn(
          "relative overflow-hidden shadow-[0_28px_70px_rgba(61,25,15,0.22)] ring-1 ring-primary/10",
          isRect ? "aspect-video rounded-3xl" : "aspect-[4/5]",
        )}
        style={isRect ? undefined : { borderRadius: BLOB_SHAPES[shape] }}
      >
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(46,20,10,0.25)_100%)]" />
      </div>
      {caption ? (
        <p
          className={cn(
            "mt-4 max-w-[16rem] text-xs font-medium uppercase tracking-[0.22em]",
            tone === "dark" ? "text-accent/80" : "text-primary/70",
          )}
        >
          {caption}
        </p>
      ) : null}
    </div>
  )
}
