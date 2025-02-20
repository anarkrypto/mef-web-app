import { Metadata } from 'next'
import { HowItWorksContent } from '@/components/how-it-works/HowItWorksContent'

export const metadata: Metadata = {
	title: 'How it Works - MINA Ecosystem Funding',
	description:
		'Learn about the MINA Ecosystem Funding proposal process and get started with your proposal journey.',
}

export default function HowItWorksPage() {
	return (
		<div className="container mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8">
			<HowItWorksContent />
		</div>
	)
}
