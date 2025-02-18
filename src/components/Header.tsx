'use client'

import Link from 'next/link'
import { Bell, Settings } from 'lucide-react'
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

export default function Header() {
	const pathname = usePathname() || ''
	const [isAdmin, setIsAdmin] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const navigation = [
		{ name: 'Home', href: '/', emoji: '🏠' },
		{
			name: 'Funding Rounds',
			href: '/funding-rounds',
			emoji: '💰',
		},
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

		checkAdminStatus()
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
