import { cn } from "@/lib/utils"

import { SectionEyebrow } from "@/components/heritage/heritage-section"

export function StoryBlock({
  eyebrow,
  heading,
  paragraphs,
  children,
  className,
}: {
  eyebrow?: string
  heading: React.ReactNode
  paragraphs?: string[]
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(className)}>
      {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
      <h2 className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {heading}
      </h2>
      {paragraphs?.length ? (
        <div className="mt-6 max-w-2xl space-y-4 text-base leading-8 text-muted-foreground sm:text-lg">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  )
}
