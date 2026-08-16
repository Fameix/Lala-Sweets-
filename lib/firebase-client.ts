"use client"

import { getApps, initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getDatabase } from "firebase/database"

export function getFirebaseClientApp() {
  const app = getApps()[0]

  if (app) {
    return app
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error("Firebase client configuration is missing.")
  }

  return initializeApp({
    apiKey,
    authDomain,
    projectId,
    appId,
    databaseURL: databaseURL || undefined,
  })
}

export function getFirebaseClientDatabase() {
  return getDatabase(getFirebaseClientApp())
}

export function getFirebaseClientFirestore() {
  return getFirestore(getFirebaseClientApp())
}
