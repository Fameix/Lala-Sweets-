import type { Product } from "@/types/catalogue"

export type AIProviderStatus = "configured" | "fallback"

export type AIChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  products?: Product[]
  confirmation?: {
    action: "add-to-cart" | "update-cart" | "remove-cart"
    productId: string
    quantity: number
    label: string
  }
}

export type AIProvider = {
  status: AIProviderStatus
  generateAssistantResponse(input: { message: string; language?: string }): Promise<AIChatMessage>
  createStructuredSummary(input: unknown): Promise<unknown>
  interpretVoiceTranscript(input: { transcript: string; language?: string }): Promise<unknown>
}

