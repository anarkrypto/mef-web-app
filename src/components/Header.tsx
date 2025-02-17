'use client'

import Link from 'next/link'
import {
	Bell,
	Settings,
	ChevronDown,
	ArchiveIcon,
	ActivityIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserStatus } from './auth/UserStatus'
import { WalletConnector } from './web3/WalletConnector'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'

interface FundingRound {
	id: string
	name: string
	endDate: Date
	status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

export default function Header() {
	const pathname = usePathname() || ''
	const [isAdmin, setIsAdmin] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([])
	const [isLoadingRounds, setIsLoadingRounds] = useState(true)

	const navigation = [
		{ name: 'Home', href: '/', emoji: '🏠' },
		{ name: 'Start Here', href: '/start-here', emoji: '🚀' },
		{ name: 'My Proposals', href: '/proposals', emoji: '📝' },
	]

	useEffect(() => {
		async function checkAdminStatus() {
			try {
				const response = await fetch('/api/admin/check')
				const data = await response.json()
				setIsAdmin(data.isAdmin)
			} catch (error) {
				console.error('Failed to check admin status:', error)
				setIsAdmin(false)
			} finally {
				setIsLoading(false)
			}
		}

		async function fetchFundingRounds() {
			try {
				const response = await fetch('/api/funding-rounds/header')
				const data = await response.json()

				// Sort funding rounds: active ones first (by end date), then completed ones
				const sortedRounds = data.sort((a: FundingRound, b: FundingRound) => {
					// If one is active and the other isn't, active comes first
					if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
					if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1

					// If both are active, sort by end date
					if (a.status === 'ACTIVE' && b.status === 'ACTIVE') {
						return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
					}

					// If both are completed/cancelled, sort by end date in reverse
					return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
				})

				setFundingRounds(sortedRounds)
			} catch (error) {
				console.error('Failed to fetch funding rounds:', error)
			} finally {
				setIsLoadingRounds(false)
			}
		}

		checkAdminStatus()
		fetchFundingRounds()
	}, [])

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-14 items-center px-4 sm:px-6 lg:px-8">
				<div className="flex flex-1 items-center justify-between md:justify-start">
					<Link href="/" className="flex items-center space-x-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6"
						>
							<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
						</svg>
						<span className="hidden font-bold sm:inline-block">MEF</span>
					</Link>
					<nav className="hidden items-center space-x-8 text-sm font-medium md:ml-12 md:flex">
						{navigation.map(item => (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'flex items-center space-x-2 transition-colors hover:text-foreground/80',
									pathname === item.href
										? 'font-semibold text-foreground'
										: 'text-foreground/60',
								)}
							>
								<span className="text-base">{item.emoji}</span>
								<span>{item.name}</span>
							</Link>
						))}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className={cn(
										'flex items-center space-x-2 transition-colors hover:text-foreground/80',
										pathname.includes('/funding-rounds') &&
											pathname.includes('/summaries')
											? 'font-semibold text-foreground'
											: 'text-foreground/60',
									)}
								>
									<span className="text-base">📊</span>
									<span>Phase Summaries</span>
									<ChevronDown className="ml-1 h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-[300px]">
								<DropdownMenuLabel>Funding Round Summaries</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{isLoadingRounds ? (
									<DropdownMenuItem disabled>
										Loading funding rounds...
									</DropdownMenuItem>
								) : fundingRounds.length === 0 ? (
									<DropdownMenuItem disabled>
										No funding rounds available
									</DropdownMenuItem>
								) : (
									fundingRounds.map(round => (
										<DropdownMenuItem key={round.id} asChild>
											<Link
												href={`/funding-rounds/${round.id}/summaries`}
												className="flex items-center justify-between"
											>
												<div className="flex items-center gap-2">
													{round.status === 'ACTIVE' ? (
														<ActivityIcon className="h-4 w-4 text-green-500" />
													) : (
														<ArchiveIcon className="h-4 w-4 text-gray-500" />
													)}
													<span>{round.name}</span>
												</div>
												<span className="text-xs text-muted-foreground">
													{round.status === 'ACTIVE'
														? `Ends ${format(new Date(round.endDate), 'MMM dd')}`
														: `Ended ${format(new Date(round.endDate), 'MMM dd')}`}
												</span>
											</Link>
										</DropdownMenuItem>
									))
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</nav>
				</div>
				<div className="ml-auto flex items-center gap-4">
					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-4 w-4" />
						<span className="sr-only">Notifications</span>
						<span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
					</Button>
					{!isLoading && isAdmin && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link href="/admin">
										<Button variant="ghost" size="icon">
											<Settings className="h-4 w-4" />
											<span className="sr-only">Admin Settings</span>
										</Button>
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<p>Admin Dashboard</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					<div className="flex items-center gap-4">
						<WalletConnector />
						<UserStatus />
					</div>
				</div>
			</div>
		</header>
	)
}
