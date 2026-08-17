"use client"

import { createContext, useContext, useEffect, useState } from "react"
import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth"

import { getFirebaseAuth } from "@/lib/firebase-client-auth"

type AdminAuthState = {
  user: User | null
  idToken: string | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthState | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getFirebaseAuth()

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null)
        setIdToken(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const tokenResult = await nextUser.getIdTokenResult()

      setUser(nextUser)
      setIdToken(tokenResult.token)
      setIsAdmin(tokenResult.claims.admin === true)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AdminAuthState = {
    user,
    idToken,
    isAdmin,
    loading,
    async signIn(email, password) {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    },
    async signOut() {
      await firebaseSignOut(getFirebaseAuth())
    },
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider.")
  }

  return context
}
