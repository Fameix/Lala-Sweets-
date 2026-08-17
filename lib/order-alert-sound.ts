"use client"

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null
  }

  if (!audioContext) {
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextCtor) {
      return null
    }

    audioContext = new AudioContextCtor()
  }

  return audioContext
}

/**
 * Must run inside a user gesture (click). Resumes/creates the AudioContext
 * and plays a silent buffer so subsequent chimes aren't blocked by browser
 * autoplay restrictions.
 */
export async function unlockOrderAlertAudio(): Promise<boolean> {
  const context = getAudioContext()

  if (!context) {
    return false
  }

  if (context.state === "suspended") {
    await context.resume().catch(() => undefined)
  }

  const silentBuffer = context.createBuffer(1, 1, 22050)
  const source = context.createBufferSource()
  source.buffer = silentBuffer
  source.connect(context.destination)
  source.start(0)

  return context.state === "running"
}

/**
 * Short two-tone restaurant-style order chime. Plays once, no looping.
 * No-ops silently if the AudioContext was never unlocked.
 */
export function playOrderAlertChime(): boolean {
  const context = getAudioContext()

  if (!context || context.state !== "running") {
    return false
  }

  const now = context.currentTime
  const notes = [880, 1318.5]

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const startAt = now + index * 0.15

    oscillator.type = "sine"
    oscillator.frequency.value = frequency

    gain.gain.setValueAtTime(0, startAt)
    gain.gain.linearRampToValueAtTime(0.9, startAt + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.5)

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start(startAt)
    oscillator.stop(startAt + 0.55)
  })

  return true
}
