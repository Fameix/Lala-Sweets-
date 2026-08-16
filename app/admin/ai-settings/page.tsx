import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEnv } from "@/lib/env"

const env = getEnv()
const settings = [
  ["AI assistant", env.AI_ASSISTANT_ENABLED ?? "fallback"],
  ["Voice ordering", env.AI_VOICE_ENABLED ?? "fallback"],
  ["Text to speech", env.AI_TEXT_TO_SPEECH_ENABLED ?? "disabled"],
  ["AI provider", env.AI_PROVIDER ? "configured" : "not configured"],
  ["Model", env.AI_MODEL ? "configured" : "not configured"],
  ["Guest daily limit", env.AI_GUEST_DAILY_LIMIT ?? "not configured"],
  ["Conversation retention days", env.AI_CONVERSATION_RETENTION_DAYS ?? "not configured"],
]

export default function AdminAISettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-3xl font-medium">AI Settings</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Configure environment-backed AI controls. Secret API keys are never displayed in the admin UI.
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Runtime settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {settings.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-border py-2 last:border-b-0">
              <span className="text-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}

