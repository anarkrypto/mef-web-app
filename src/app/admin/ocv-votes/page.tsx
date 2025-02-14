import { OCVVotesTable } from '@/components/admin/ocv-votes/OCVVotesTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'OCV Votes | MEF Admin',
	description: 'Monitor OCV consideration votes and project eligibility',
}

export default function OCVVotesPage() {
	return (
		<div className="container mx-auto max-w-7xl p-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						OCV Consideration Votes
					</CardTitle>
				</CardHeader>
				<CardContent>
					<OCVVotesTable />
				</CardContent>
			</Card>
		</div>
	)
}
