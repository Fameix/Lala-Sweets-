import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url().optional().or(z.literal("")),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_DATABASE_URL: z.string().url().optional().or(z.literal("")),
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  NEXT_PUBLIC_AI_ASSISTANT_ENABLED: z.string().optional(),
  AI_ASSISTANT_ENABLED: z.string().optional(),
  AI_VOICE_ENABLED: z.string().optional(),
  AI_TEXT_TO_SPEECH_ENABLED: z.string().optional(),
  AI_PROVIDER: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_API_KEY: z.string().optional(),
  AI_GUEST_DAILY_LIMIT: z.string().optional(),
  AI_CONVERSATION_RETENTION_DAYS: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  ADMIN_NOTIFICATION_EMAILS: z.string().optional(),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  DELIVERY_ADMIN_API_KEY: z.string().optional(),
  DELIVERY_PARTNER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_PROVIDER: z.string().optional(),
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
  ADMIN_PREVIEW_ENABLED: z.string().optional(),
})

export function getEnv() {
  return envSchema.parse(process.env)
}
