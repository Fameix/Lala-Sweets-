"use client"

import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"

import { getFirebaseClientApp } from "@/lib/firebase-client"

let recaptchaVerifier: RecaptchaVerifier | null = null

export function getFirebaseAuth() {
  return getAuth(getFirebaseClientApp())
}

// Firebase Phone Auth requires an invisible reCAPTCHA bound to a DOM node
// before signInWithPhoneNumber will send a real SMS. Cached across calls so
// re-sending an OTP (e.g. "Resend OTP") reuses the same widget instead of
// re-rendering it.
function getRecaptchaVerifier(containerId: string) {
  if (recaptchaVerifier) {
    return recaptchaVerifier
  }

  recaptchaVerifier = new RecaptchaVerifier(getFirebaseAuth(), containerId, {
    size: "invisible",
  })

  return recaptchaVerifier
}

export async function sendOtp(phoneNumberWithCountryCode: string, containerId = "recaptcha-container"): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier(containerId)

  try {
    return await signInWithPhoneNumber(getFirebaseAuth(), phoneNumberWithCountryCode, verifier)
  } catch (error) {
    // A failed send can leave the reCAPTCHA widget in a used/invalid state -
    // reset it so the next attempt gets a fresh challenge instead of also failing.
    resetRecaptcha()
    throw error
  }
}

export function resetRecaptcha() {
  recaptchaVerifier?.clear()
  recaptchaVerifier = null
}

export function mapFirebaseAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code

  // The generic fallback message below hides which of many possible Firebase
  // Auth error codes actually occurred, which makes real failures (e.g. Phone
  // sign-in not enabled in Firebase Console) hard to diagnose from a
  // screenshot alone. Always log the real code/message to the console.
  console.error("[firebase-auth]", error)

  switch (code) {
    case "auth/invalid-phone-number":
      return "Enter a valid 10-digit mobile number."
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while before trying again."
    case "auth/invalid-verification-code":
      return "That code isn't correct. Please check and try again."
    case "auth/code-expired":
      return "This OTP has expired. Please request a new one."
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again."
    case "auth/captcha-check-failed":
      return "Verification failed. Please refresh and try again."
    case "auth/operation-not-allowed":
      return "Mobile sign-in isn't turned on yet for this store. Please contact support or try Continue as guest."
    case "auth/app-not-authorized":
    case "auth/unauthorized-domain":
      return "This site isn't authorized for mobile sign-in yet. Please try Continue as guest."
    case "auth/invalid-app-credential":
    case "auth/missing-app-credential":
    case "auth/argument-error":
      return "Verification setup failed. Please refresh the page and try again."
    case "auth/quota-exceeded":
      return "OTP limit reached for now. Please try again later or use Continue as guest."
    default: {
      const rawCode = code ? ` (${code})` : ""
      return `Something went wrong${process.env.NODE_ENV === "development" ? rawCode : ""}. Please try again.`
    }
  }
}
