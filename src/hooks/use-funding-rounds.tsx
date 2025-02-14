import logger from '@/logging'
import { FundingRoundWithPhases } from '@/types/funding-round'
import { useQuery } from '@tanstack/react-query'

export function useFundingRounds() {
	return useQuery<FundingRoundWithPhases[]>({
		queryKey: ['funding-rounds'],
		queryFn: async () => {
			const response = await fetch('/api/funding-rounds')
			if (!response.ok) {
				logger.error('Failed to fetch funding rounds', response)
				throw new Error('Failed to fetch funding rounds')
			}
			return response.json()
		},
	})
}
