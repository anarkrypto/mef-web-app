import { differenceInSeconds, formatDistanceToNow, isPast } from 'date-fns'
import type { PhaseTimeInfo, PhaseStatusInfo } from '@/types/phase-summary'

export const getPhaseStatus = (timeInfo: PhaseTimeInfo): PhaseStatusInfo => {
	const now = new Date()

	if (now < timeInfo.startDate) {
		return {
			status: 'not-started',
			text: `Starts ${formatDistanceToNow(timeInfo.startDate, { addSuffix: true })}`,
			badge: 'secondary',
			progressColor: 'from-blue-500 to-blue-600',
		}
	}

	if (isPast(timeInfo.endDate)) {
		return {
			status: 'ended',
			text: `Ended ${formatDistanceToNow(timeInfo.endDate, { addSuffix: true })}`,
			badge: 'secondary',
			progressColor: 'from-blue-500 to-blue-600',
		}
	}

	return {
		status: 'ongoing',
		text: `Ends ${formatDistanceToNow(timeInfo.endDate, { addSuffix: true })}`,
		badge: 'default',
		progressColor: 'from-emerald-500 to-emerald-600',
	}
}

export const getPhaseProgress = (timeInfo: PhaseTimeInfo): number => {
	const now = new Date()

	if (now < timeInfo.startDate) {
		// Calculate progress until start
		const announcementDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Assume announced 7 days before
		const totalWaitDuration = differenceInSeconds(
			timeInfo.startDate,
			announcementDate,
		)
		const elapsedWait = differenceInSeconds(now, announcementDate)
		return Math.min(Math.max((elapsedWait / totalWaitDuration) * 100, 0), 100)
	}

	if (isPast(timeInfo.endDate)) {
		return 100
	}

	// Calculate progress during phase
	const totalDuration = differenceInSeconds(
		timeInfo.endDate,
		timeInfo.startDate,
	)
	const elapsed = differenceInSeconds(now, timeInfo.startDate)
	return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
}

export const getProgressColor = (progress: number): string => {
	if (progress <= 33) return 'from-emerald-500 to-emerald-600'
	if (progress <= 66) return 'from-amber-500 to-amber-600'
	return 'from-rose-500 to-rose-600'
}
