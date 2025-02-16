import { ArrowRightIcon, Clock, Coins, FileText, Timer } from 'lucide-react'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import React from 'react'
import { FundingRound, FundingRoundStatus } from '@/types/funding-round'
import { Button } from '../ui/button'
import Link from 'next/link'

const formatMinaNumber = (n: number | string) =>
	new Intl.NumberFormat('en-US').format(Number(n))

export type RoundCardProps = FundingRound & React.ComponentProps<typeof Card>

const getStatusColor = (status: FundingRoundStatus) => {
	switch (status) {
		case 'ACTIVE':
			return 'bg-primary text-primary-foreground'
		case 'UPCOMING':
			return 'bg-accent-mint text-accent-mint-foreground'
		case 'COMPLETED':
			return 'bg-muted text-muted-foreground'
		default:
			return 'bg-gray-100 text-gray-600'
	}
}

export const FundingRoundCard = ({
	id,
	name,
	status,
	proposalsCount,
	totalBudget,
	startDate,
	endDate,
	phase,
	description,
	...props
}: RoundCardProps) => {
	const timeUntilEnd = new Date(endDate).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})

	const info = [
		{
			title: 'Proposals',
			value: proposalsCount,
			icon: FileText,
		},
		{
			title: 'MINA Funding',
			value: formatMinaNumber(totalBudget),
			icon: Coins,
		},
		{
			title: 'Until End',
			value: timeUntilEnd,
			icon: Clock,
		},
		{
			title: 'Current Phase',
			value: phase,
			icon: Timer,
		},
	]

	const isActive = status === 'ACTIVE'

	return (
		<Card
			{...props}
			className={cn(
				'rounded-l-none border-l-4',
				status === 'ACTIVE' &&
					'border-primary/30 bg-gradient-to-tr from-primary/5 to-card',
				props.className,
			)}
		>
			<CardHeader className="pb-2">
				<div className="flex justify-between">
					<CardTitle className="text-xl font-semibold text-[#2D2D2D] md:text-2xl">
						{name}
					</CardTitle>
					<span
						className={`h-fit w-fit rounded-full px-2 py-1 text-xs font-semibold leading-6 md:text-sm ${getStatusColor(
							status,
						)}`}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				<div>
					{status === 'ACTIVE' && <div>{description}</div>}
					<div className="grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
						{info.map(({ title, value, icon: Icon }) => (
							<div className="flex flex-col items-start md:items-center">
								<div className="flex items-center gap-2">
									<div
										className={cn(
											'rounded-full p-1.5 md:p-2',
											isActive
												? 'bg-primary/10 text-primary'
												: 'bg-muted text-muted-foreground',
										)}
									>
										<Icon className="h-4 w-4 md:h-6 md:w-6" />
									</div>
									<div>
										<div
											className={cn(
												isActive
													? 'text-base font-semibold md:text-lg'
													: 'text-base font-semibold md:text-lg',
											)}
										>
											{value}
										</div>
										<div
											className={cn(
												'text-sm md:text-base',
												isActive ? 'text-secondary' : 'text-gray-600',
											)}
										>
											{title}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
			<CardFooter className="justify-end">
				{phase !== 'UPCOMING' && (
					<Link
						href={`/funding-rounds/${id}/${phase === 'COMPLETED' ? 'summaries' : phase.toLowerCase()}`}
					>
						<Button size="lg" variant="secondary">
							{phase === 'COMPLETED' ? 'View Summary' : 'View Details'}
							<ArrowRightIcon className="h-4 w-4" />
						</Button>
					</Link>
				)}
			</CardFooter>
		</Card>
	)
}
