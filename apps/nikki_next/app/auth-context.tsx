"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { LoginUser } from "../../../packages/core/src/api/login.ts"
import { getCurrentUser, logout as logoutApi } from "../lib/api"

type AuthContextValue = {
  user: LoginUser | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const publicRoutes = ["/", "/signup"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<LoginUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const session = await getCurrentUser()
      setUser(session?.user ?? null)
      if (!session && !publicRoutes.includes(pathname)) {
        router.replace("/")
      }
    } catch (error) {
      console.error("Failed to verify session", error)
      setUser(null)
      if (!publicRoutes.includes(pathname)) {
        router.replace("/")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // Re-check session when navigating between routes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      setUser(null)
      router.replace("/")
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, refresh, logout: handleLogout }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
