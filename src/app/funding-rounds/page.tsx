'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
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
import { fundingRoundSortSchema, SortOption } from '@/services'
import { useQueryState } from 'nuqs'

const sortByOptions: {
	value: SortOption['sortBy']
	label: string
}[] = [
	{ value: 'startDate', label: 'Date' },
	{ value: 'status', label: 'Status' },
	{ value: 'totalBudget', label: 'Total Funding' },
]

export default function FundingRounds() {
	const [searchQuery, setSearchQuery] = useState('')

	const [sortBy, setSortBy] = useQueryState<SortOption['sortBy']>('sortBy', {
		defaultValue: 'status',
		parse: value => fundingRoundSortSchema.shape.sortBy.parse(value),
	})

	const [sortOrder, setSortOrder] = useQueryState<SortOption['sortOrder']>(
		'sortOrder',
		{
			defaultValue: 'desc',
			parse: value => fundingRoundSortSchema.shape.sortOrder.parse(value),
		},
	)

	const { isLoading, data: rounds = [] } = useFundingRounds({
		sortOption: {
			sortBy,
			sortOrder,
		},
	})

	if (isLoading) {
		return <FundingRoundsSkeleton />
	}

	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-[#2D2D2D]">Funding Rounds</h1>
				<div className="flex gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
						<Input
							placeholder="Search rounds..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className="hidden w-[300px] pl-9 md:block"
						/>
					</div>
					<Select
						value={sortBy}
						onValueChange={value => setSortBy(value as SortOption['sortBy'])}
					>
						<SelectTrigger className="w-[180px]">
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
