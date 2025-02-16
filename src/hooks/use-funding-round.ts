import logger from '@/logging'
import { FundingRoundWithPhases } from '@/types/funding-round'
import { useQuery } from '@tanstack/react-query'

export function useFundingRound({ id }: { id: string }) {
	const url = `/api/funding-rounds/${id}`

	return useQuery<FundingRoundWithPhases>({
		queryKey: [url],
		queryFn: async () => {
			const response = await fetch(url)
			if (!response.ok) {
				logger.error('Failed to fetch funding round', response)
				throw new Error('Failed to fetch funding round')
			}
			return response.json()
		},
	})
}
