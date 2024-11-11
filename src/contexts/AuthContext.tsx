'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AuthProvider } from '@/types/auth'
import { useFeedback } from './FeedbackContext'
import { useRouter, useSearchParams } from 'next/navigation'

interface UserInfo {
  username: string
  authSource: {
    type: AuthProvider
    id: string
  }
}

interface AuthContextValue {
  user: UserInfo | null
  isLoading: boolean
  login: (provider: AuthProvider) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { success, error: showError } = useFeedback()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for auth success message
  useEffect(() => {
    const message = searchParams?.get('message')
    if (message === 'auth_success') {
      success('Successfully logged in')
      // Remove the message from URL
      const url = new URL(window.location.href)
      url.searchParams.delete('message')
      window.history.replaceState({}, '', url)
      // Refresh user data
      refreshUser()
    }
  }, [searchParams])

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/me/info', {
        headers: {
          'Accept': 'application/json'
        }
      })

      // If response is not JSON, user is not authenticated
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setUser(null)
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } else {
        // Handle error responses
        if (response.status === 401) {
          setUser(null)
        } else {
          console.error('Failed to fetch user:', await response.text())
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (provider: AuthProvider) => {
    // Placeholder for future implementation
    showError('Login functionality will be implemented soon')
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to logout')
      }

      // Clear user state
      setUser(null)

      // Show success message
      success('Successfully logged out')

      // Redirect to home page
      router.push('/')
      router.refresh() // Refresh the page to update server components
    } catch (error) {
      showError('Failed to logout. Please try again.')
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 