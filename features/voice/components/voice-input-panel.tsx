"use client"

import { useMemo, useState } from "react"
import { Mic, Square, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type SpeechRecognitionConstructor = new () => SpeechRecognition

type SpeechRecognition = {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } }; length: number } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function VoiceInputPanel({ onConfirm }: { onConfirm: (transcript: string) => void }) {
  const [status, setStatus] = useState<"idle" | "listening" | "ready" | "error" | "unsupported">("idle")
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [privacySeen, setPrivacySeen] = useState(false)
  const supported = useMemo(() => {
    if (typeof window === "undefined") return false
    return Boolean((window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor; SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition)
  }, [])

  const start = () => {
    setPrivacySeen(true)
    const SpeechRecognitionApi = (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor; SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ?? (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition

    if (!SpeechRecognitionApi) {
      setStatus("unsupported")
      return
    }

    const nextRecognition = new SpeechRecognitionApi()
    nextRecognition.lang = "ta-IN"
    nextRecognition.interimResults = true
    nextRecognition.continuous = false
    nextRecognition.onresult = (event) => {
      const nextTranscript = Array.from({ length: event.results.length }, (_, index) => event.results[index][0].transcript).join(" ")
      setTranscript(nextTranscript)
      setStatus("ready")
    }
    nextRecognition.onerror = () => setStatus("error")
    nextRecognition.onend = () => setStatus((current) => (current === "listening" ? "ready" : current))
    nextRecognition.start()
    setRecognition(nextRecognition)
    setStatus("listening")
  }

  const stop = () => {
    recognition?.stop()
    setStatus("ready")
  }

  return (
    <div className="grid gap-3 rounded-lg border border-border p-3">
      {!privacySeen ? (
        <Alert>
          <AlertTitle>Voice privacy</AlertTitle>
          <AlertDescription>Your voice is used only to understand this request. Review the transcript before continuing.</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {status === "listening" ? (
          <Button type="button" size="sm" variant="outline" onClick={stop} aria-label="Stop listening">
            <Square className="size-4" />
            Stop
          </Button>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={start} aria-label="Speak your order">
            <Mic className="size-4" />
            Speak Your Order
          </Button>
        )}
        <Button type="button" size="sm" disabled={!transcript.trim()} onClick={() => onConfirm(transcript)}>
          <Wand2 className="size-4" />
          Use This Request
        </Button>
      </div>
      {supported ? null : <p className="text-xs text-muted-foreground">Voice may be unsupported in this browser. Typed search remains available.</p>}
      {status === "listening" ? <p className="text-sm text-muted-foreground" aria-live="polite">Listening...</p> : null}
      {status === "error" || status === "unsupported" ? <p className="text-sm text-destructive">Voice input is unavailable. Type your request instead.</p> : null}
      <Textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Transcript appears here. Tamil, English and Tanglish text are supported." />
    </div>
  )
}

