'use client'

import Link from 'next/link'
import { Bell, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserStatus } from './auth/UserStatus'
import { WalletConnector } from './web3/WalletConnector'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAdminStatus } from '@/hooks/use-admin-status'

export default function Header() {
	const pathname = usePathname()

	const navigation = [
		{ label: 'Get Involved', href: '/' },
		{ label: 'How it Works', href: '/how-it-works' },
		{ label: 'Funding Rounds', href: '/funding-rounds' },
		{ label: 'Proposals', href: '/proposals' },
		{ label: 'About Us', href: '/about-us' },
	]

	const { isAdmin } = useAdminStatus()

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-14 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
				<div className="relative flex h-14 flex-1 items-center justify-between md:justify-start">
					<Link href="/" className="flex items-center space-x-2">
						<span className="hidden text-xl font-bold sm:inline-block">
							MEF
						</span>
					</Link>
					<nav className="absolute top-[1px] hidden h-14 items-center space-x-4 px-4 text-base font-medium md:ml-12 md:flex lg:px-8 xl:px-16">
						{navigation.map(tab => (
							<Link key={tab.href} href={tab.href}>
								<div
									className={cn(
										'flex h-14 items-center space-x-2 px-4 transition-colors hover:text-secondary',
										pathname === tab.href
											? 'border-b-4 border-secondary font-semibold text-secondary'
											: 'text-foreground/60',
									)}
								>
									{tab.label}
								</div>
							</Link>
						))}
					</nav>
				</div>
				<div className="ml-auto flex items-center gap-4">
					{isAdmin && (
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
