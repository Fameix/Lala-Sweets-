import { AIAssistantPanel } from "@/features/ai/components/ai-assistant-panel"
import { StorefrontShell } from "@/components/layout/storefront-shell"
import { Card } from "@/components/ui/card"

export default function AIAssistantPage() {
  return (
    <StorefrontShell>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-heading text-3xl font-medium">Lala AI Assistant</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Search verified products, review voice transcripts, and prepare enquiry details before anything changes.
        </p>
        <Card className="mt-6 h-[42rem]">
          <AIAssistantPanel />
        </Card>
      </main>
    </StorefrontShell>
  )
}

