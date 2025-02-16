'use client'

import { useState } from 'react'
import { ArrowDownNarrowWide, ArrowDownWideNarrow, Search } from 'lucide-react'
import { FundingRoundCard } from '@/components/funding-rounds/FundingRoundCard'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useFundingRounds } from '@/hooks/use-funding-rounds'
import { FundingRoundsSkeleton } from './loading'
import {
	getPublicFundingRoundsOptionsSchema,
	GetPublicFundingRoundOptions,
} from '@/services'
import { useQueryState } from 'nuqs'

const sortByOptions: {
	value: NonNullable<GetPublicFundingRoundOptions['sortBy']>
	label: string
}[] = [
	{ value: 'startDate', label: 'Date' },
	{ value: 'status', label: 'Status' },
	{ value: 'totalBudget', label: 'Budget' },
]

export default function FundingRounds() {
	const [searchQuery, setSearchQuery] = useState('')

	const [sortBy, setSortBy] = useQueryState<
		GetPublicFundingRoundOptions['sortBy']
	>('sortBy', {
		defaultValue: 'status',
		parse: value =>
			getPublicFundingRoundsOptionsSchema.shape.sortBy.parse(value),
	})

	const [sortOrder, setSortOrder] = useQueryState<
		GetPublicFundingRoundOptions['sortOrder']
	>('sortOrder', {
		defaultValue: 'desc',
		parse: value =>
			getPublicFundingRoundsOptionsSchema.shape.sortOrder.parse(value),
	})

	const [filterName, setFilterName] = useQueryState('filterName')

	const { isLoading, data: rounds = [] } = useFundingRounds({
		filterName: filterName,
		sortBy: sortBy,
		sortOrder: sortOrder,
	})

	if (isLoading) {
		return <FundingRoundsSkeleton />
	}

	return (
		<div>
			<div className="mb-8">
				<div className="mb-4 text-secondary">
					<h1 className="text-2xl font-bold">Funding Rounds</h1>
					<p>
						Explore and participate in funding rounds for community proposals.
					</p>
				</div>
				<div className="flex justify-between gap-4">
					<div className="relative md:block">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							placeholder="Search rounds..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="w-[170px] pl-9 md:w-[300px]"
							onKeyDown={e => {
								if (e.key === 'Enter') {
									setFilterName(searchQuery)
								}
							}}
						/>
					</div>
					<div className="flex gap-2">
						<Select
							value={sortBy || undefined}
							onValueChange={value =>
								setSortBy(
									value as NonNullable<GetPublicFundingRoundOptions['sortBy']>,
								)
							}
						>
							<SelectTrigger className="w-[90px]">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{sortByOptions.map(option => (
										<SelectItem value={option.value}>{option.label}</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select
							value={sortOrder || undefined}
							onValueChange={value =>
								setSortOrder(
									value as NonNullable<
										GetPublicFundingRoundOptions['sortOrder']
									>,
								)
							}
						>
							<SelectTrigger className="w-[50px]">
								<SelectValue placeholder="Order by" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={'asc'}>
										<ArrowDownNarrowWide className="mr-1 inline h-5 w-5" />
										Ascending
									</SelectItem>
									<SelectItem value={'desc'}>
										<ArrowDownWideNarrow className="mr-1 inline h-5 w-5" />
										Descending
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				{rounds.map(round => (
					<Link
						href={`/rounds/${round.id}`}
						key={round.id}
						className={cn('h-full')}
					>
						<FundingRoundCard {...round} className="h-full" />
					</Link>
				))}
			</div>

			{rounds.length === 0 && (
				<div className="mt-8 text-center text-gray-500">
					No rounds found matching your search.
				</div>
			)}
		</div>
	)
}
