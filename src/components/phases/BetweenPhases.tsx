'use client'

import { useEffect, useState } from 'react'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from '@/components/ui/card'
import { format } from 'date-fns'

interface Props {
	currentPhase: string | null
	nextPhaseStart: Date
	nextPhaseName: string
}

export function BetweenPhases({
	currentPhase,
	nextPhaseStart,
	nextPhaseName,
}: Props) {
	const [timeRemaining, setTimeRemaining] = useState<string>('')

	useEffect(() => {
		const calculateTimeRemaining = () => {
			const now = new Date()
			const diff = nextPhaseStart.getTime() - now.getTime()

			const days = Math.floor(diff / (1000 * 60 * 60 * 24))
			const hours = Math.floor(
				(diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
			)
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
			const seconds = Math.floor((diff % (1000 * 60)) / 1000)

			setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
		}

		calculateTimeRemaining()
		const interval = setInterval(calculateTimeRemaining, 1000)

		return () => clearInterval(interval)
	}, [nextPhaseStart])

	return (
		<Card className="bg-muted/50">
			<CardHeader>
				<CardTitle>⏳ Between Phases</CardTitle>
				<CardDescription>
					{currentPhase
						? `${currentPhase} phase has ended.`
						: 'Waiting for next phase to begin.'}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-center">
						<h3 className="text-lg font-medium">Next Phase: {nextPhaseName}</h3>
						<p className="mt-2 text-3xl font-bold">{timeRemaining}</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Starts on {format(nextPhaseStart, "PPP 'at' p")}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
