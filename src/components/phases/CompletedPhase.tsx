import { Card, CardContent } from '@/components/ui/card'

export function CompletedPhase() {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="space-y-4 text-center">
					<div className="text-4xl">🏁</div>
					<h3 className="text-xl font-semibold">Funding Round Completed</h3>
					<p className="text-muted-foreground">
						This funding round has ended. Results and funded proposals will be
						displayed here soon.
					</p>
				</div>
			</CardContent>
		</Card>
	)
}
