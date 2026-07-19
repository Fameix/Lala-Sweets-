"use client"

import { usePathname } from "next/navigation"
import { Bot } from "lucide-react"

import { AIAssistantPanel } from "@/features/ai/components/ai-assistant-panel"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function AIAssistantLauncher() {
  const pathname = usePathname()

  if (process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED === "false") {
    return null
  }

  if (pathname === "/custom-cake") {
    return null
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            size="lg"
            className="fixed bottom-20 right-4 z-50 gap-2 shadow-lg md:bottom-5"
            aria-label="Open Master AI Assistant"
          />
        }
      >
        <Bot className="size-4" />
        <span className="hidden sm:inline">Ask Master AI</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md" showCloseButton>
        <SheetHeader>
          <SheetTitle>Master AI Assistant</SheetTitle>
          <SheetDescription>Find products, calculate cake size, and review voice requests before cart changes.</SheetDescription>
        </SheetHeader>
        <AIAssistantPanel />
      </SheetContent>
    </Sheet>
  )
}
