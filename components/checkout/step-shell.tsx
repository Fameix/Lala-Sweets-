"use client"

import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StepShell({
  title,
  description,
  onBack,
  children,
  className,
}: {
  title: string
  description?: string
  onBack?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2 -ml-2 gap-1 text-muted-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>
      ) : null}
      <Card className={cn("border-primary/10", className)}>
        <CardContent className="grid gap-5 py-2">
          <div className="grid gap-1 text-center">
            <h2 className="font-heading text-xl font-medium sm:text-2xl">{title}</h2>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  )
}
