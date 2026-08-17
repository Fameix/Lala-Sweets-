import { cn } from "@/lib/utils"

import { OrganicImage } from "@/components/heritage/organic-image"
import { StoryBlock } from "@/components/heritage/story-block"
import { SITE_CONTENT_CLASS } from "@/components/layout/storefront-shell"

export function ImageStoryBlock({
  eyebrow,
  heading,
  paragraphs,
  imageSrc,
  imageAlt,
  imageCaption,
  reverse = false,
  shape = "a",
  children,
}: {
  eyebrow?: string
  heading: React.ReactNode
  paragraphs?: string[]
  imageSrc: string
  imageAlt: string
  imageCaption?: string
  reverse?: boolean
  shape?: "a" | "b" | "c" | "rect"
  children?: React.ReactNode
}) {
  return (
    <div className={cn(SITE_CONTENT_CLASS, "grid gap-14 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-10")}>
      <div className={cn(reverse ? "lg:order-2" : "lg:order-1")}>
        <OrganicImage src={imageSrc} alt={imageAlt} shape={shape} caption={imageCaption} className="mx-auto max-w-sm lg:mx-0" />
      </div>
      <div className={cn(reverse ? "lg:order-1" : "lg:order-2")}>
        <StoryBlock eyebrow={eyebrow} heading={heading} paragraphs={paragraphs}>
          {children}
        </StoryBlock>
      </div>
    </div>
  )
}
