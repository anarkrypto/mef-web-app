import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
	CheckCircledIcon,
	CheckIcon,
	CountdownTimerIcon,
	Cross2Icon,
	CrossCircledIcon,
} from '@radix-ui/react-icons'
import type { IconProps } from '@radix-ui/react-icons/dist/types'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table'
import { Vote, VoteStatus } from '@/types/phase-summary'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

interface Props {
	votes: Vote[]
	title: string
}

interface VotesTableStatus {
	value: VoteStatus
	icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
}

interface VotesTableDirection {
	value: 'FOR' | 'AGAINST'
	icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>
}

export const votesTableStatuses = [
	{
		value: 'Pending',
		icon: CountdownTimerIcon,
	},
	{
		value: 'Orphaned',
		icon: CrossCircledIcon,
	},
	{
		value: 'Canonical',
		icon: CheckCircledIcon,
	},
] satisfies VotesTableStatus[]

export const votesTableDirections = [
	{
		value: 'FOR',
		icon: CheckIcon,
	},
	{
		value: 'AGAINST',
		icon: Cross2Icon,
	},
] satisfies VotesTableDirection[]

export const VotesTable = ({ votes, title }: Props) => {
	return (
		<Card>
			<CardHeader className="py-3">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>
			<CardContent className="p-3">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[300px]">Height</TableHead>
							<TableHead>Timestap</TableHead>
							<TableHead>Account</TableHead>
							<TableHead>Hash</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{votes.map(vote => (
							<TableRow key={vote.hash}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<span>{vote.height}</span>
									</div>
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										<span>{vote.timestamp}</span>
									</div>
									{/* {topic.reviewerGroups.map(rg => (
										<Badge key={rg.reviewerGroup.id} variant="outline">
											{rg.reviewerGroup.name}
										</Badge>
									))} */}
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex flex-wrap gap-1">
										<span>
											{vote.account.slice(0, 12) +
												'...' +
												vote.account.slice(-6)}
										</span>
									</div>
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex flex-wrap gap-1">
										<span>
											{vote.hash.slice(0, 12) + '...' + vote.hash.slice(-6)}
										</span>
									</div>
								</TableCell>
								<TableCell className="font-medium">
									<div className="flex flex-wrap gap-1">
										<span>{vote.status}</span>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	)
}
