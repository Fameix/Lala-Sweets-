// One-time setup: creates (or updates) the Firebase Auth user for the admin
// dashboard and grants it the `admin: true` custom claim that every
// requireAdminActor() check in the app relies on. Run this once per
// environment - it is the only place that ever grants the admin claim, so
// there is no runtime "become admin" endpoint anywhere in the app.
//
// Usage: node --env-file=.env.local scripts/bootstrap-admin.mjs

import { cert, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

function requireEnv(name) {
  const value = process.env[name]?.trim()

  if (!value) {
    console.error(`Missing required env var ${name}. Set it in .env.local before running this script.`)
    process.exit(1)
  }

  return value
}

const adminEmail = requireEnv("ADMIN_EMAIL")
const adminPassword = requireEnv("ADMIN_PASSWORD")
const serviceAccountKeyRaw = requireEnv("FIREBASE_SERVICE_ACCOUNT_KEY")

let serviceAccount
try {
  serviceAccount = JSON.parse(serviceAccountKeyRaw)
} catch {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON.")
  process.exit(1)
}

initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
  }),
})

const auth = getAuth()

async function main() {
  let user

  try {
    user = await auth.getUserByEmail(adminEmail)
    await auth.updateUser(user.uid, { password: adminPassword })
    console.log(`Updated existing admin user ${adminEmail} (${user.uid}).`)
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error
    }

    user = await auth.createUser({ email: adminEmail, password: adminPassword, emailVerified: true })
    console.log(`Created admin user ${adminEmail} (${user.uid}).`)
  }

  await auth.setCustomUserClaims(user.uid, { admin: true })
  console.log(`Granted admin claim to ${adminEmail}. Existing sign-ins must sign out/in to pick it up.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
