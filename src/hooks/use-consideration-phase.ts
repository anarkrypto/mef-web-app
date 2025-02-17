'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { ConsiderationProposal } from '@/types/consideration'
import type { Dispatch, SetStateAction } from 'react'

interface UseConsiderationPhaseResult {
	proposals: ConsiderationProposal[]
	loading: boolean
	error: string | null
	setProposals: Dispatch<SetStateAction<ConsiderationProposal[]>>
}

export function useConsiderationPhase(
	fundingRoundId: string,
): UseConsiderationPhaseResult {
	const [proposals, setProposals] = useState<ConsiderationProposal[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { toast } = useToast()

	useEffect(() => {
		async function fetchProposals() {
			try {
				const response = await fetch(
					`/api/funding-rounds/${fundingRoundId}/consideration-proposals`,
				)

				if (!response.ok) {
					throw new Error('Failed to fetch proposals')
				}

				const data = await response.json()
				setProposals(data)
			} catch (err) {
				const message =
					err instanceof Error ? err.message : 'Failed to fetch proposals'
				setError(message)
				toast({
					title: 'Error',
					description: message,
					variant: 'destructive',
				})
			} finally {
				setLoading(false)
			}
		}

		fetchProposals()
	}, [fundingRoundId, toast])

	return {
		proposals,
		loading,
		error,
		setProposals,
	}
}
