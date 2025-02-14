import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Dispatch, SetStateAction } from 'react'
import { SumbmittedProposalsJSON } from '@/app/api/funding-rounds/[id]/submitted-proposals/route'

interface UseSubmissionPhaseResult {
	proposals: SumbmittedProposalsJSON[]
	loading: boolean
	error: string | null
	setProposals: Dispatch<SetStateAction<SumbmittedProposalsJSON[]>>
}

export function useSubmissionPhase(
	fundingRoundId: string,
): UseSubmissionPhaseResult {
	const [proposals, setProposals] = useState<SumbmittedProposalsJSON[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { toast } = useToast()

	useEffect(() => {
		async function fetchProposals() {
			try {
				const response = await fetch(
					`/api/funding-rounds/${fundingRoundId}/submitted-proposals`,
				)

				if (!response.ok) {
					throw new Error('Failed to fetch proposals')
				}

				const data = await response.json()

				const transformedData = data.map(
					(proposal: SumbmittedProposalsJSON) => ({
						...proposal,
					}),
				)

				setProposals(transformedData)
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
