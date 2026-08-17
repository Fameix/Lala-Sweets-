import "server-only"

import { cert, getApps, initializeApp, type App, type Credential } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getDatabase } from "firebase-admin/database"
import { getFirestore } from "firebase-admin/firestore"

import { getEnv } from "@/lib/env"

type ParsedFirebaseConfig = {
  projectId?: string
  databaseURL?: string
}

type CredentialSource = "FIREBASE_SERVICE_ACCOUNT_KEY" | "FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY" | "application-default"

type FirebaseAdminDiagnostics = {
  projectIdSource: "NEXT_PUBLIC_FIREBASE_PROJECT_ID" | "FIREBASE_PROJECT_ID" | "FIREBASE_DATABASE_URL" | "FIREBASE_CONFIG" | "GOOGLE_CLOUD_PROJECT" | "GCLOUD_PROJECT" | "unknown"
  resolvedProjectId: string
  configuredProjectId: string | null
  resolvedDatabaseURL: string
  databaseProjectIdFromURL: string | null
  databaseHost: string | null
  credentialSource: CredentialSource
}

type FirebaseAdminConnectionSuccess = {
  initialized: true
  projectId: string | null
  authInitialized: boolean
  diagnostics: FirebaseAdminDiagnostics
  firestore: {
    connected: true
    documentExists: boolean
  }
  realtimeDatabase: {
    connected: true
    value: unknown
  }
}

type FirebaseAdminConnectionFailure = {
  initialized: false
  projectId: string | null
  authInitialized: boolean
  diagnostics: FirebaseAdminDiagnostics
  failedAt: "firestore" | "realtimeDatabase"
  error: string
  remediation: string
}

const permissionDeniedRemediation = (projectId: string, credentialSource: CredentialSource) =>
  credentialSource === "application-default"
    ? `The Admin SDK is using Application Default Credentials (no service-account key involved). Find out which identity ADC resolves to on this machine (run "gcloud auth list" or check the "account" field in the active gcloud config), then in Google Cloud Console → IAM → Grant Access, add that exact identity (it may be your own Google account, not a service account) with the "Cloud Datastore User" (roles/datastore.user) role on project "${projectId}" — this is a plain IAM role grant on an existing principal and does not require creating or downloading any key. Also confirm: (a) the IAM change was made on project "${projectId}" itself and not a similarly-named project, (b) a Firestore database actually exists for this project (Firebase Console → Firestore Database → Create database, Native mode), and (c) the Cloud Firestore API is enabled for this project in Google Cloud Console.`
    : `The Admin SDK is using an explicit service-account credential (${credentialSource}), but that service account is not authorized to use Cloud Firestore on project "${projectId}". In Google Cloud Console → IAM, grant that service account the "Cloud Datastore User" (roles/datastore.user) role on project "${projectId}", and confirm a Firestore database exists (Firebase Console → Firestore Database) and the Cloud Firestore API is enabled.`

function parseFirebaseConfig(): ParsedFirebaseConfig | null {
  const rawConfig = process.env.FIREBASE_CONFIG

  if (!rawConfig?.trim().startsWith("{")) {
    return null
  }

  try {
    return JSON.parse(rawConfig) as ParsedFirebaseConfig
  } catch {
    return null
  }
}

function parseFirebaseDatabaseProjectId(databaseURL: string) {
  try {
    const hostname = new URL(databaseURL).hostname

    if (hostname.endsWith(".firebaseio.com")) {
      const subdomain = hostname.replace(".firebaseio.com", "")

      if (subdomain.endsWith("-default-rtdb")) {
        return subdomain.slice(0, -"-default-rtdb".length)
      }

      return subdomain || null
    }

    if (hostname.endsWith(".firebasedatabase.app")) {
      const subdomain = hostname.replace(".firebasedatabase.app", "")

      if (subdomain.endsWith("-default-rtdb")) {
        return subdomain.slice(0, -"-default-rtdb".length)
      }

      return subdomain || null
    }

    return null
  } catch {
    return null
  }
}

function resolveFirebaseProjectId() {
  const env = getEnv()
  const config = parseFirebaseConfig()
  const databaseURL = env.FIREBASE_DATABASE_URL || config?.databaseURL || ""
  const databaseProjectId = databaseURL ? parseFirebaseDatabaseProjectId(databaseURL) : null
  const projectIdSource: FirebaseAdminDiagnostics["projectIdSource"] = databaseProjectId
    ? "FIREBASE_DATABASE_URL"
    : env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
      : env.FIREBASE_PROJECT_ID
        ? "FIREBASE_PROJECT_ID"
        : config?.projectId
          ? "FIREBASE_CONFIG"
          : process.env.GOOGLE_CLOUD_PROJECT
            ? "GOOGLE_CLOUD_PROJECT"
            : process.env.GCLOUD_PROJECT
              ? "GCLOUD_PROJECT"
              : "unknown"

  return {
    projectId:
      databaseProjectId ||
      env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      env.FIREBASE_PROJECT_ID ||
      config?.projectId ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      "",
    projectIdSource,
    configuredProjectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || config?.projectId || null,
    databaseProjectIdFromURL: databaseProjectId,
  }
}

function resolveFirebaseDatabaseURL(projectId: string) {
  const env = getEnv()
  const config = parseFirebaseConfig()

  return (
    env.FIREBASE_DATABASE_URL ||
    config?.databaseURL ||
    `https://${projectId}-default-rtdb.firebaseio.com`
  )
}

function getFirebaseAdminAppName(projectId: string) {
  return `firebase-admin:${projectId}`
}

function resolveFirebaseAdminCredential(): { credential: Credential; source: CredentialSource } {
  const env = getEnv()
  const serviceAccountKeyRaw = env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim()

  if (serviceAccountKeyRaw) {
    let serviceAccount: { project_id?: string; client_email?: string; private_key?: string }

    try {
      serviceAccount = JSON.parse(serviceAccountKeyRaw)
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full service-account key JSON as a single-line value.")
    }

    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing project_id, client_email, or private_key.")
    }

    return {
      credential: cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
      }),
      source: "FIREBASE_SERVICE_ACCOUNT_KEY",
    }
  }

  const clientEmail = env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = env.FIREBASE_PRIVATE_KEY?.trim()

  if (clientEmail && privateKey) {
    const projectResolution = resolveFirebaseProjectId()

    return {
      credential: cert({
        projectId: projectResolution.projectId || undefined,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      source: "FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY",
    }
  }

  throw new Error(
    "Firebase Admin credentials are not configured. Add FIREBASE_SERVICE_ACCOUNT_KEY as a single-line JSON service account, or set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY. Do not rely on Application Default Credentials for local development here.",
  )
}

function buildFirebaseAdminDiagnostics(projectId: string, databaseURL: string, credentialSource: CredentialSource): FirebaseAdminDiagnostics {
  const env = getEnv()
  const config = parseFirebaseConfig()
  const databaseHost = databaseURL ? new URL(databaseURL).hostname : null

  return {
    projectIdSource: resolveFirebaseProjectId().projectIdSource,
    resolvedProjectId: projectId,
    configuredProjectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || config?.projectId || null,
    resolvedDatabaseURL: databaseURL,
    databaseProjectIdFromURL: parseFirebaseDatabaseProjectId(databaseURL),
    databaseHost,
    credentialSource,
  }
}

const credentialSourceByAppName = new Map<string, CredentialSource>()

export function getFirebaseAdminApp(): App {
  const projectResolution = resolveFirebaseProjectId()
  const projectId = projectResolution.projectId
  const appName = getFirebaseAdminAppName(projectId || "unresolved")
  const existingApp = getApps().find((app) => app.name === appName)

  if (existingApp) {
    return existingApp
  }

  if (!projectId) {
    throw new Error(
      "Firebase project ID is missing. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_PROJECT_ID, or GOOGLE_CLOUD_PROJECT.",
    )
  }

  const databaseURL = resolveFirebaseDatabaseURL(projectId)
  const { credential, source } = resolveFirebaseAdminCredential()

  credentialSourceByAppName.set(appName, source)

  return initializeApp({
    credential,
    projectId,
    databaseURL,
  }, appName)
}

function getCredentialSourceForApp(app: App): CredentialSource {
  return credentialSourceByAppName.get(app.name) ?? "application-default"
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp())
}

export function getFirebaseAdminDb() {
  return getFirebaseAdminFirestore()
}

export function getFirebaseAdminDatabase() {
  return getDatabase(getFirebaseAdminApp())
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp())
}

export async function verifyFirebaseAdminConnection(): Promise<FirebaseAdminConnectionSuccess | FirebaseAdminConnectionFailure> {
  const app = getFirebaseAdminApp()
  const firestore = getFirestore(app)
  const database = getDatabase(app)
  const auth = getAuth(app)
  const credentialSource = getCredentialSourceForApp(app)
  const diagnostics = buildFirebaseAdminDiagnostics(
    app.options.projectId ?? "",
    app.options.databaseURL ?? "",
    credentialSource,
  )

  console.info("[firebase-admin:test] diagnostics", {
    projectIdSource: diagnostics.projectIdSource,
    resolvedProjectId: diagnostics.resolvedProjectId,
    configuredProjectId: diagnostics.configuredProjectId,
    databaseProjectIdFromURL: diagnostics.databaseProjectIdFromURL,
    databaseHost: diagnostics.databaseHost,
    authInitialized: Boolean(auth),
  })

  try {
    const firestoreSnapshot = await firestore.doc("_firebase_admin_healthcheck/firestore").get()

    console.info("[firebase-admin:test] firestore check passed", {
      projectId: diagnostics.resolvedProjectId,
    })

    try {
      const realtimeDatabaseSnapshot = await database.ref("_firebase_admin_healthcheck/realtime-database").get()

      console.info("[firebase-admin:test] realtime database check passed", {
        projectId: diagnostics.resolvedProjectId,
      })

      return {
        initialized: true,
        projectId: app.options.projectId ?? null,
        authInitialized: Boolean(auth),
        diagnostics,
        firestore: {
          connected: true,
          documentExists: firestoreSnapshot.exists,
        },
        realtimeDatabase: {
          connected: true,
          value: realtimeDatabaseSnapshot.val(),
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      console.error("[firebase-admin:test] realtime database check failed", {
        projectId: diagnostics.resolvedProjectId,
        databaseHost: diagnostics.databaseHost,
        error: message,
      })
      return {
        initialized: false,
        projectId: app.options.projectId ?? null,
        authInitialized: Boolean(auth),
        diagnostics,
        failedAt: "realtimeDatabase",
        error: message,
        remediation: message.includes("PERMISSION_DENIED")
          ? permissionDeniedRemediation(diagnostics.resolvedProjectId, credentialSource)
          : "Check FIREBASE_DATABASE_URL and confirm the Realtime Database instance exists for this project.",
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error("[firebase-admin:test] firestore check failed", {
      projectId: diagnostics.resolvedProjectId,
      error: message,
    })
    return {
      initialized: false,
      projectId: app.options.projectId ?? null,
      authInitialized: Boolean(auth),
      diagnostics,
      failedAt: "firestore",
      error: message,
      remediation: message.includes("PERMISSION_DENIED")
        ? permissionDeniedRemediation(diagnostics.resolvedProjectId, credentialSource)
        : "Confirm a Firestore database exists for this project (Firebase Console → Firestore Database → Create database) and that FIREBASE_PROJECT_ID / NEXT_PUBLIC_FIREBASE_PROJECT_ID point at it.",
    }
  }
}
