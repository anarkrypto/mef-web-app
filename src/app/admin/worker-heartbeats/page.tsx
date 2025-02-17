import { WorkerHeartbeatsTable } from '@/components/admin/worker-heartbeats/WorkerHeartbeatsTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Worker Heartbeats | MEF Admin',
	description: 'Monitor background job statuses and heartbeats',
}

export default function WorkerHeartbeatsPage() {
	return (
		<div className="container mx-auto max-w-7xl p-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Worker Heartbeats
					</CardTitle>
				</CardHeader>
				<CardContent>
					<WorkerHeartbeatsTable />
				</CardContent>
			</Card>
		</div>
	)
}
