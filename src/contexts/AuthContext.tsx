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

/**
 * Checks if authentication cookies exist
 */
function hasAuthCookies(): boolean {
  // Check for either access_token or refresh_token
  return document.cookie.split(';').some(cookie => {
    const trimmed = cookie.trim()
    return trimmed.startsWith('access_token=') || trimmed.startsWith('refresh_token=')
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const refresh = useCallback(async () => {
    try {
      // Only attempt to fetch user info if we have auth cookies
      if (!hasAuthCookies()) {
        setUser(null)
        return
      }

      const res = await fetch('/api/me/info')
      
      if (res.status === 401) {
        setUser(null)
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch user info')
      }

      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      console.error('Error refreshing user info:', error)
      toast({
        title: "Error",
        description: "Failed to load user information",
        variant: "destructive",
      })
      setUser(null)
    }
  }, [toast])

  useEffect(() => {
    // Only run initial auth check if we have cookies
    if (hasAuthCookies()) {
      refresh().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [refresh])

  const login = useCallback((provider: AuthSource['type']) => {
    // TODO: Implement login logic
  }, [])

  const logout = useCallback(async () => {
    try {
      // Only attempt logout if we have auth cookies
      if (!hasAuthCookies()) {
        setUser(null)
        router.push('/')
        return
      }

      const res = await fetch('/api/auth/logout', { 
        method: 'POST',
        // Ensure cookies are included in the request
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Logout failed')
      }

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