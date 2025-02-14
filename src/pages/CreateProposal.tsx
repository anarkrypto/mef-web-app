'use client'

import CreateProposalComponent from '@/components/CreateProposal'
import { FeedbackProvider } from '@/contexts/FeedbackContext'

export default function CreateProposal() {
	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 py-8">
				<FeedbackProvider>
					<CreateProposalComponent />
				</FeedbackProvider>
			</main>
		</div>
	)
}
