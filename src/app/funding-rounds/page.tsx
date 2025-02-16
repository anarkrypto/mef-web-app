'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowDownNarrowWide, ArrowDownWideNarrow, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { FundingRoundCard } from '@/components/funding-rounds/FundingRoundCard'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectGroup,
	SelectItem,
} from '@/components/ui/select'
import { FundingRoundsSkeleton } from './loading'
import { useFundingRounds } from '@/hooks/use-funding-rounds'
import {
	getPublicFundingRoundsOptionsSchema,
	GetPublicFundingRoundOptions,
} from '@/services'
import { useQueryState } from 'nuqs'
import { FundingRoundWithPhases } from '@/types/funding-round'

const SORT_OPTIONS: {
	value: NonNullable<GetPublicFundingRoundOptions['sortBy']>
	label: string
}[] = [
	{ value: 'startDate', label: 'Date' },
	{ value: 'status', label: 'Status' },
	{ value: 'totalBudget', label: 'Budget' },
]

export default function FundingRounds() {
	const { sortBy, sortOrder, filterName } = useFundingRoundsSearchParams()

	const { isLoading, data: rounds = [] } = useFundingRounds({
		filterName,
		sortBy,
		sortOrder,
	})

	if (isLoading) {
		return <FundingRoundsSkeleton />
	}

	return (
		<main className="space-y-8">
			<FundingRoundsHeader />

			<FundingRoundsControls />

			<FundingRoundsList rounds={rounds} />
		</main>
	)
}

function useFundingRoundsSearchParams() {
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

	return {
		sortBy,
		sortOrder,
		filterName,
		setSortBy,
		setSortOrder,
		setFilterName,
	}
}

function FundingRoundsHeader() {
	return (
		<header className="text-secondary">
			<h1 className="mb-2 text-2xl font-bold">Funding Rounds</h1>
			<p>Explore and participate in funding rounds for community proposals.</p>
		</header>
	)
}

function FundingRoundsControls() {
	const {
		sortBy,
		sortOrder,
		filterName,
		setSortBy,
		setSortOrder,
		setFilterName,
	} = useFundingRoundsSearchParams()

	const [searchQuery, setSearchQuery] = useState(filterName || '')

	const handleSearchKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				setFilterName(e.currentTarget.value)
			}
		},
		[],
	)

	const handleSortByChange = useCallback(
		(value: NonNullable<GetPublicFundingRoundOptions['sortBy']>) => {
			setSortBy(value)
		},
		[],
	)

	const handleSortOrderChange = useCallback(
		(value: NonNullable<GetPublicFundingRoundOptions['sortOrder']>) => {
			setSortOrder(value)
		},
		[],
	)

	return (
		<section className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
			{/* Search Form */}
			<form
				onSubmit={e => {
					e.preventDefault()
				}}
				className="relative w-full md:max-w-md"
				aria-label="Search funding rounds"
			>
				<label htmlFor="search-input" className="sr-only">
					Search funding rounds
				</label>
				<Search
					className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
					aria-hidden="true"
				/>
				<Input
					id="search-input"
					type="search"
					placeholder="Search rounds..."
					value={searchQuery}
					onKeyDown={handleSearchKeyDown}
					onChange={e => setSearchQuery(e.target.value)}
					className="w-full pl-9"
				/>
			</form>

			{/* Sorting Controls */}
			<div className="flex gap-2">
				{/* Sort by */}
				<Select value={sortBy || undefined} onValueChange={handleSortByChange}>
					<SelectTrigger className="w-[90px]" aria-label="Sort by">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{SORT_OPTIONS.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>

				{/* Sort order */}
				<Select
					value={sortOrder || undefined}
					onValueChange={handleSortOrderChange}
				>
					<SelectTrigger className="w-[50px]" aria-label="Sort order">
						<SelectValue placeholder="Order" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="asc">
								<ArrowDownNarrowWide className="mr-1 inline h-5 w-5" />
								Asc
							</SelectItem>
							<SelectItem value="desc">
								<ArrowDownWideNarrow className="mr-1 inline h-5 w-5" />
								Desc
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>
		</section>
	)
}

function FundingRoundsList({ rounds }: { rounds: FundingRoundWithPhases[] }) {
	return (
		<section className="flex flex-col gap-6">
			{rounds.map(round => (
				<Link
					href={`/rounds/${round.id}`}
					key={round.id}
					className={cn('h-full')}
				>
					<FundingRoundCard {...round} className="h-full" />
				</Link>
			))}

			{/* Empty State */}
			{rounds.length === 0 && (
				<p className="mt-8 text-center text-gray-500">
					No rounds found matching your search.
				</p>
			)}
		</section>
	)
}
