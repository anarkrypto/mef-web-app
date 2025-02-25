'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProcessVisualization } from './ProcessVisualization'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FAQ } from './FAQ'
import { faqData } from '@/data/faq'
import Link from 'next/link'

export function HowItWorksContent() {
	const router = useRouter()
	const currentPhase = 'submission' as unknown
	const selectedRound = '' as unknown

	return (
		<div className="space-y-12">
			{/* Header Section */}
			<div className="space-y-6 text-center">
				<div className="space-y-4">
					<h1 className="text-4xl font-bold tracking-tight">How It Works</h1>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Welcome to the MINA Ecosystem Funding process. Here you can learn
						about the different phases and get started with your proposal
						journey.
					</p>
				</div>
			</div>

			{/* Process Visualization */}
			<div className="rounded-xl border bg-card p-8 shadow-sm">
				<ProcessVisualization />
			</div>

			{/* Action Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card className="transition-all duration-200 hover:shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span className="text-lg">📝</span> Create a Proposal
						</CardTitle>
						<CardDescription>
							Start your journey by creating a new proposal for the MINA
							ecosystem
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							onClick={() => router.push('/proposals/create')}
							className="w-full"
						>
							Create Proposal <ArrowRightIcon className="ml-2 h-4 w-4" />
						</Button>
					</CardContent>
				</Card>

				<Card
					className={cn(
						'transition-all duration-200 hover:shadow-md',
						currentPhase === 'submission' && 'border-primary shadow-sm',
					)}
				>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span className="text-lg">🔍</span> Check Proposals
						</CardTitle>
						<CardDescription>
							View and review submitted proposals in the current funding round
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							variant="secondary"
							onClick={() => router.push(`/`)}
							className="w-full"
						>
							View Proposals <ArrowRightIcon className="ml-2 h-4 w-4" />
						</Button>
					</CardContent>
				</Card>

				<Card className="transition-all duration-200 hover:shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<span className="text-lg">📊</span> Phase Summary
						</CardTitle>
						<CardDescription>
							Get a detailed overview of the current phase and its progress
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Link href={`/funding-rounds/${selectedRound}`}>
							<Button variant="outline" className="w-full">
								View Summary <ArrowRightIcon className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</CardContent>
				</Card>
			</div>

			{/* FAQ Section */}
			<div className="mt-16">
				<div className="mb-12 space-y-4 text-center">
					<h2 className="text-4xl font-bold tracking-tight">
						Frequently asked questions
					</h2>
					<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
						Quick answers to common questions about the proposal process.
					</p>
				</div>
				<FAQ sections={faqData} />
			</div>
		</div>
	)
}
