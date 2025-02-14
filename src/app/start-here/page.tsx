import { Metadata } from 'next'
import { StartHereContent } from '@/components/start-here/StartHereContent'

export const metadata: Metadata = {
	title: 'Start Here - MINA Ecosystem Funding',
	description:
		'Learn about the MINA Ecosystem Funding proposal process and get started with your proposal journey.',
}

export default function StartHerePage() {
	return (
		<div className="container mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-4 py-8">
			<StartHereContent />
		</div>
	)
}
