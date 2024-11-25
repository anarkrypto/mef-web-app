'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"

export type AuthSource = {
  type: 'discord' | 'telegram' | 'wallet'
  id: string
  username: string
}

interface User {
  id: string
  metadata: {
    username: string
    authSource: AuthSource
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (provider: AuthSource['type']) => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/me/info')
      if (!res.ok) throw new Error('Failed to fetch user info')
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error refreshing user info:', error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setIsLoading(false))
  }, [refresh])

  const login = useCallback((provider: AuthSource['type']) => {
    // Existing login logic...
  }, [])

  const logout = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }, [router, toast])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 