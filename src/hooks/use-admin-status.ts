import logger from '@/logging'
import { useQuery } from '@tanstack/react-query'

export function useAdminStatus() {
	const { data, ...result } = useQuery({
		queryKey: ['adminStatus'],
		queryFn: async () => {
			const response = await fetch('/api/admin/check')
			if (!response.ok) {
				logger.error('Failed to check admin status:', response)
				throw new Error('Failed to check admin status')
			}
			return response.json()
		},
		staleTime: 5 * 60 * 1000, // Cache result for 5 minutes
	})

	return {
		isAdmin: data?.isAdmin ?? false,
		...result,
	}
}
