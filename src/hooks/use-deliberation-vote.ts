'use client'

import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"

export function useDeliberationVote() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const submitVote = async (
    proposalId: number, 
    feedback: string,
    recommendation?: boolean
  ) => {
    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/funding-rounds/${proposalId}/deliberation-proposals/${proposalId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback, recommendation }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit deliberation')
      }

      toast({
        title: "Success",
        description: "Your deliberation has been submitted.",
      })

      return await response.json()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit deliberation'
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    submitVote,
    isLoading,
  }
} 