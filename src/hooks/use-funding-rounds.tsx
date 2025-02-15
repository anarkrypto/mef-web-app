import logger from '@/logging'
import { SortOption } from '@/services'
import { FundingRoundWithPhases } from '@/types/funding-round'
import { useQuery } from '@tanstack/react-query'

export function useFundingRounds({
	sortOption,
}: { sortOption?: SortOption } = {}) {
	const searchParams = new URLSearchParams()
	if (sortOption) {
		searchParams.set('sortBy', sortOption.sortBy)
		searchParams.set('sortOrder', sortOption.sortOrder)
	}

	const url = `/api/funding-rounds?${searchParams.toString()}`

	return useQuery<FundingRoundWithPhases[]>({
		queryKey: [url],
		queryFn: async () => {
			const response = await fetch(url)
			if (!response.ok) {
				logger.error('Failed to fetch funding rounds', response)
				throw new Error('Failed to fetch funding rounds')
			}
			return response.json()
		},
	})
}
