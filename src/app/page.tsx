'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useAuth } from '@/contexts/AuthContext'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card'

export default function HomePage() {
	const searchParams = useSearchParams()
	const feedback = useFeedback()
	const { user, isLoading } = useAuth()

	useEffect(() => {
		// Check for error param on mount and after navigation
		const error = searchParams?.get('error')
		if (error === 'unauthorized_admin') {
			feedback.error("You don't have permission to access the admin area", {
				duration: 5000, // Show for 5 seconds
			})

			// Clean up URL after showing toast
			const url = new URL(window.location.href)
			url.searchParams.delete('error')
			window.history.replaceState({}, '', url)
		}
	}, [searchParams, feedback])

	if (isLoading) {
		return <div>Loading...</div>
	}

	// Don't render funding round components if user isn't authenticated
	if (!user) {
		return (
			<div className="container mx-auto max-w-7xl p-6">
				<Card>
					<CardHeader>
						<CardTitle>Welcome to Mina Ecosystem Funding</CardTitle>
						<CardDescription>
							Please sign in to view active funding rounds and participate in
							the ecosystem.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		)
	}

	return <>Page in Development</>
}
