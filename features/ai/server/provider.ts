import { calculateCakeServing } from "@/features/serving-calculator/calculate"
import { getActiveCakeServingRules } from "@/features/serving-calculator/rules"
import { findCartIntent, searchProductsTool } from "@/features/ai/tools/catalogue-tools"
import type { AIChatMessage, AIProvider } from "@/features/ai/types"
import { getEnv } from "@/lib/env"

function detectServingIntent(message: string) {
  const normalized = message.toLowerCase()
  const guestMatch = normalized.match(/(\d+)\s*(people|guests|persons|பேர்|ku)/)

  if (!/(cake size|how much cake|evlo cake|எவ்வளவு கேக்|people-ku)/i.test(message) || !guestMatch) {
    return null
  }

  return Number(guestMatch[1])
}

export function getAIProvider(): AIProvider {
  const env = getEnv()
  const configured = Boolean(env.AI_PROVIDER && env.AI_MODEL && env.AI_API_KEY)

  return {
    status: configured ? "configured" : "fallback",
    async generateAssistantResponse({ message, language }) {
      const id = crypto.randomUUID()
      const cartIntent = findCartIntent(message)

      if (cartIntent) {
        return {
          id,
          role: "assistant",
          content: "Please confirm before I change your cart.",
          products: searchProductsTool(message).slice(0, 1),
          confirmation: cartIntent,
        }
      }

      const guests = detectServingIntent(message)
      if (guests) {
        const result = calculateCakeServing(
          {
            adults: guests,
            children: 0,
            portionPreference: "standard",
            dessertContext: "main-dessert",
          },
          getActiveCakeServingRules()
        )

        return {
          id,
          role: "assistant",
          content: `For ${guests} guests, the configured estimate is ${(result.recommendedWeightGrams / 1000).toLocaleString("en-IN")} kg. Serving estimates may vary depending on slice size and serving style.`,
          products: result.suggestedProducts,
        }
      }

      const products = searchProductsTool(message)
      const tamilPrefix = language === "ta" ? "உறுதிப்படுத்தப்பட்ட பொருட்களில் இருந்து கண்டுபிடித்தவை:" : "Here are matching Lala Sweets catalogue items:"

      if (products.length === 0) {
        return {
          id,
          role: "assistant",
          content: "I could not find a confirmed catalogue match. You can browse the menu or try a product name, flavour, category, or budget.",
        }
      }

      return {
        id,
        role: "assistant",
        content: configured ? tamilPrefix : `${tamilPrefix} AI provider credentials are not configured, so I am using the safe catalogue fallback.`,
        products,
      }
    },
    async createStructuredSummary(input) {
      return input
    },
    async interpretVoiceTranscript({ transcript, language }) {
      return {
        language: language ?? "mixed",
        originalTranscript: transcript,
        interpretedText: transcript,
        intent: /cart|add|சேர்/i.test(transcript) ? "cart-action-needs-confirmation" : "shopping-request",
        requiresConfirmation: true,
      }
    },
  }
}

export async function generateFallbackAssistantMessage(message: string, language?: string): Promise<AIChatMessage> {
  return getAIProvider().generateAssistantResponse({ message, language })
}

