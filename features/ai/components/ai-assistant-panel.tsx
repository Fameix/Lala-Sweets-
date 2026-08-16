"use client"

import { useState } from "react"
import { Bot, SendHorizontal, Trash2 } from "lucide-react"

import { AIConfirmationCard } from "@/features/ai/components/ai-confirmation-card"
import { AIProductRecommendationCard } from "@/features/ai/components/ai-product-recommendation-card"
import { VoiceInputPanel } from "@/features/voice/components/voice-input-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { AIChatMessage } from "@/features/ai/types"

const quickActions = [
  "Find ghee halwa",
  "Show traditional sweets",
  "Show products available today",
  "Find products within my budget",
  "Plan snacks for a group",
  "Check delivery availability",
  "Track my order",
  "Prepare an enquiry",
  "Speak my order",
]

export function AIAssistantPanel() {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi, I am Lala AI Assistant. I can search the catalogue and help prepare an enquiry. Availability and order details should be confirmed with the shop.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = async (message = input) => {
    const trimmed = message.trim()
    if (!trimmed) return

    const userMessage: AIChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed }
    setMessages((current) => [...current, userMessage])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language: "mixed" }),
      })

      if (!response.ok) {
        throw new Error("Assistant is temporarily unavailable.")
      }

      const data = (await response.json()) as AIChatMessage
      setMessages((current) => [...current, data])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Assistant is temporarily unavailable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-6 pb-6">
      <Alert>
        <Bot className="size-4" />
        <AlertTitle>Lala Sweets only</AlertTitle>
        <AlertDescription>Voice and chat requests are reviewed before cart actions. The site still works when AI credentials are missing.</AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action) => (
          <Button key={action} type="button" size="sm" variant="outline" onClick={() => action === "Speak my order" ? undefined : send(action)}>
            {action}
          </Button>
        ))}
      </div>
      <VoiceInputPanel onConfirm={(transcript) => send(transcript)} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground" : "max-w-[90%] rounded-lg bg-muted px-3 py-2 text-sm"}>
            <p>{message.content}</p>
            {message.products ? (
              <div className="mt-3 grid gap-3">
                {message.products.map((product) => (
                  <AIProductRecommendationCard key={product.id} product={product} />
                ))}
              </div>
            ) : null}
            {message.confirmation ? (
              <div className="mt-3">
                <AIConfirmationCard
                  label={message.confirmation.label}
                  productId={message.confirmation.productId}
                  quantity={message.confirmation.quantity}
                  onDone={(confirmed) =>
                    setMessages((current) => [
                      ...current,
                      {
                        id: crypto.randomUUID(),
                        role: "assistant",
                        content: confirmed ? "Added after your confirmation." : "Cancelled. I did not change your cart.",
                      },
                    ])
                  }
                />
              </div>
            ) : null}
          </div>
        ))}
        {loading ? <p className="text-sm text-muted-foreground">Processing...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask for halwa, sweets, savouries, or enquiry help" />
        <Button type="submit" size="icon" aria-label="Send message">
          <SendHorizontal className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="outline" aria-label="Clear conversation" onClick={() => setMessages([])}>
          <Trash2 className="size-4" />
        </Button>
      </form>
    </div>
  )
}

