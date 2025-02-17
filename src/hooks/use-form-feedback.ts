import { useState } from 'react'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useRouter } from 'next/navigation'

interface UseFormFeedbackOptions<T> {
	onSuccess?: (data: T) => void
	onError?: (error: unknown) => void
	successMessage?: string
	errorMessage?: string
	redirectPath?: string
}

export function useFormFeedback<T>({
	onSuccess,
	onError,
	successMessage = 'Changes saved successfully',
	errorMessage = 'Failed to save changes',
	redirectPath,
}: UseFormFeedbackOptions<T> = {}) {
	const [loading, setLoading] = useState(false)
	const { success, error: showError } = useFeedback()
	const router = useRouter()

	const handleSubmit = async (
		submitFn: () => Promise<T>,
		options: { silent?: boolean } = {},
	) => {
		setLoading(true)
		try {
			const data = await submitFn()

			if (!options.silent) {
				success(successMessage)
			}

			onSuccess?.(data)

			if (redirectPath) {
				router.push(redirectPath)
			}

			return data
		} catch (err) {
			const message = err instanceof Error ? err.message : errorMessage
			if (!options.silent) {
				showError(message)
			}
			onError?.(err)
			throw err
		} finally {
			setLoading(false)
		}
	}

	return {
		loading,
		handleSubmit,
	}
}
