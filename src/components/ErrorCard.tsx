import { AlertTriangle } from 'lucide-react'
import { Card } from './ui/card'

interface ErrorCardProps {
	title?: string
	message: string
}

export function ErrorCard({ title = 'Error', message }: ErrorCardProps) {
	return (
		<Card className="mx-auto w-full max-w-md border border-destructive/10 bg-destructive/5 p-6 backdrop-blur-sm">
			<div className="flex items-center gap-4">
				<div className="rounded-full bg-destructive/10 p-3">
					<AlertTriangle className="h-6 w-6 text-destructive" />
				</div>
				<div className="flex-1">
					<h3 className="mb-1 text-lg font-medium text-destructive">{title}</h3>
					<p className="text-gray-600 dark:text-gray-300">{message}</p>
				</div>
			</div>
		</Card>
	)
}
