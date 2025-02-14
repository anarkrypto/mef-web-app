'use client'

import { useState } from 'react'
import { Search, SortDesc } from 'lucide-react'
import { FundingRoundCard } from '@/components/funding-rounds/FundingRoundCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FundingRoundWithPhases } from '@/types/funding-round'
import { useFundingRounds } from '@/hooks/use-funding-rounds'
import { FundingRoundsSkeleton } from './loading'

export default function FundingRounds() {
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<'status' | 'funding' | 'time'>('status')

	const { isLoading, data: rounds = [] } = useFundingRounds()

	const sortRounds = (rounds: FundingRoundWithPhases[]) => {
		return [...rounds].sort((a, b) => {
			if (sortBy === 'status') {
				if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
				if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
				return 0
			}
			if (sortBy === 'funding') {
				return Number(b.totalBudget) - Number(a.totalBudget)
			}
			// Sort by time remaining
			return a.endDate.localeCompare(b.endDate)
		})
	}

	const filteredRounds = sortRounds(rounds).filter(round =>
		round.name.toLowerCase().includes(searchQuery.toLowerCase()),
	)

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
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<SortDesc className="h-4 w-4" />
								Sort by
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onClick={() => setSortBy('status')}>
								Status
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortBy('funding')}>
								Total Funding
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortBy('time')}>
								Time Remaining
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="flex flex-col gap-6">
				{filteredRounds.map(round => (
					<Link
						href={`/rounds/${round.id}`}
						key={round.id}
						className={cn('h-full')}
					>
						<FundingRoundCard {...round} className="h-full" />
					</Link>
				))}
			</div>

			{filteredRounds.length === 0 && (
				<div className="mt-8 text-center text-gray-500">
					No rounds found matching your search.
				</div>
			)}
		</div>
	)
}
