'use client'

import { useState, useEffect, useRef } from 'react'
import { FundingRoundStatus, WorkerStatus } from '@prisma/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon, Bot, ClockIcon, AlertTriangle } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ProcessingResultsTable } from './ProcessingResultsTable'
import { useToast } from '@/hooks/use-toast'
import { ProcessingResult } from '@/lib/gpt-survey/runner'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

interface SerializedFundingRound {
	id: string
	mefId: number
	createdById: string
	topicId: string
	name: string
	description: string
	status: FundingRoundStatus
	startDate: string
	endDate: string
	totalBudget: string
	createdAt: string
	updatedAt: string
}

interface ProcessedProposal {
	id: number
	hasSummary: boolean
}

interface WorkerMetadata {
	roundId: string
	forceSummary: boolean
	startedAt: string
	processed_proposals?: ProcessedProposal[]
	error?: string
	killedAt?: string
}

interface LastExecution {
	status: string
	timestamp: string
	metadata: WorkerMetadata
}

interface Props {
	fundingRounds: SerializedFundingRound[]
}

export function GptSurveyProcessingView({ fundingRounds }: Props) {
	const [selectedRoundId, setSelectedRoundId] = useState<string>('')
	const [isProcessing, setIsProcessing] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [results, setResults] = useState<ProcessingResult[]>([])
	const [lastExecution, setLastExecution] = useState<LastExecution | null>(null)
	const [forceSummary, setForceSummary] = useState(false)
	const { toast } = useToast()
	const [isPolling, setIsPolling] = useState(false)
	const pollInterval = useRef<NodeJS.Timeout>()

	// Load data when funding round is selected
	useEffect(() => {
		const loadRoundData = async () => {
			if (!selectedRoundId) {
				setResults([])
				return
			}

			try {
				setIsLoading(true)
				const response = await fetch(
					`/api/admin/gpt-survey/status?roundId=${selectedRoundId}`,
				)
				if (!response.ok) {
					throw new Error('Failed to load funding round data')
				}

				const data = await response.json()
				setResults(data.results)
				setLastExecution(data.lastExecution)
			} catch (error) {
				toast({
					title: 'Error',
					description:
						error instanceof Error
							? error.message
							: 'Failed to load funding round data',
					variant: 'destructive',
				})
			} finally {
				setIsLoading(false)
			}
		}

		loadRoundData()
	}, [selectedRoundId, toast])

	// Cleanup polling on unmount
	useEffect(() => {
		return () => {
			if (pollInterval.current) {
				clearInterval(pollInterval.current)
			}
		}
	}, [])

	const startPolling = () => {
		setIsPolling(true)
		pollInterval.current = setInterval(async () => {
			try {
				const response = await fetch('/api/admin/gpt-survey/status')
				if (!response.ok) throw new Error('Failed to fetch status')

				const data = await response.json()
				setLastExecution(data.lastExecution)

				// If job is no longer running, stop polling and refresh results
				if (!data.isRunning && selectedRoundId) {
					stopPolling()
					const resultsResponse = await fetch(
						`/api/admin/gpt-survey/status?roundId=${selectedRoundId}`,
					)
					if (resultsResponse.ok) {
						const resultsData = await resultsResponse.json()
						setResults(resultsData.results)
					}
				}
			} catch (error) {
				console.error('Failed to poll status:', error)
			}
		}, 5000)
	}

	const stopPolling = () => {
		if (pollInterval.current) {
			clearInterval(pollInterval.current)
			pollInterval.current = undefined
		}
		setIsPolling(false)
		setIsProcessing(false)
	}

	const handleProcess = async () => {
		if (!selectedRoundId) {
			toast({
				title: 'Error',
				description: 'Please select a funding round',
				variant: 'destructive',
			})
			return
		}

		try {
			setIsProcessing(true)
			const response = await fetch('/api/admin/gpt-survey/process', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					roundId: selectedRoundId,
					forceSummary,
				}),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Failed to process funding round')
			}

			const data = await response.json()
			setLastExecution(data.lastExecution)
			startPolling()

			toast({
				title: 'Processing Started',
				description:
					'GPT Survey processing has been initiated. Please wait for it to complete.',
			})
		} catch (error) {
			stopPolling()
			toast({
				title: 'Error',
				description:
					error instanceof Error ? error.message : 'An error occurred',
				variant: 'destructive',
			})
			setIsProcessing(false)
		}
	}

	const handleForceKill = async () => {
		try {
			const response = await fetch('/api/admin/gpt-survey/kill', {
				method: 'POST',
			})

			if (!response.ok) {
				throw new Error('Failed to kill running job')
			}

			toast({
				title: 'Success',
				description:
					'Running job has been killed. You can now start a new process.',
			})
			stopPolling()
		} catch (error) {
			toast({
				title: 'Error',
				description:
					error instanceof Error ? error.message : 'Failed to kill running job',
				variant: 'destructive',
			})
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString()
	}

	const ProcessButton = () => {
		if (!isProcessing) {
			return (
				<Button onClick={handleProcess} disabled={!selectedRoundId}>
					<Bot className="mr-2 h-4 w-4" />
					Process
				</Button>
			)
		}

		return (
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button variant="destructive">
						<div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
						Running - Click to Kill
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Kill Running Process?</AlertDialogTitle>
						<AlertDialogDescription>
							This will forcefully terminate the running GPT Survey processing
							job. This action cannot be undone. Check{' '}
							<Link
								href="/admin/worker-heartbeats"
								className="text-primary hover:underline"
							>
								Worker Heartbeats
							</Link>{' '}
							for information on running jobs.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleForceKill}>
							<AlertTriangle className="mr-2 h-4 w-4" />
							Force Kill
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		)
	}

	return (
		<div className="space-y-6">
			<Alert>
				<InfoIcon className="h-4 w-4" />
				<AlertDescription className="ml-2">
					This tool processes community feedback for proposals in a funding
					round using the GPT Survey integration. Proposals will be created if
					they don&apos;t exist, and summaries will be generated for proposals
					with feedback.
				</AlertDescription>
			</Alert>

			{lastExecution && (
				<Alert
					variant={
						lastExecution.status === WorkerStatus.COMPLETED
							? 'default'
							: 'destructive'
					}
				>
					<ClockIcon className="h-4 w-4" />
					<AlertDescription className="ml-2">
						Last execution: {formatDate(lastExecution.timestamp)} - Status:{' '}
						{lastExecution.status}
						{lastExecution.metadata?.processed_proposals && (
							<div className="mt-1 text-sm text-muted-foreground">
								Processed {lastExecution.metadata.processed_proposals.length}{' '}
								proposals (
								{
									lastExecution.metadata.processed_proposals.filter(
										(p: ProcessedProposal) => p.hasSummary,
									).length
								}{' '}
								with summaries)
							</div>
						)}
					</AlertDescription>
				</Alert>
			)}

			<Card className="p-6">
				<div className="space-y-4">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<Select
								value={selectedRoundId}
								onValueChange={setSelectedRoundId}
								disabled={isProcessing}
							>
								<SelectTrigger className="w-[300px]">
									<SelectValue placeholder="Select a funding round" />
								</SelectTrigger>
								<SelectContent>
									{fundingRounds.map(round => (
										<SelectItem key={round.id} value={round.id}>
											{round.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<ProcessButton />
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="force-summary"
								checked={forceSummary}
								onCheckedChange={checked => setForceSummary(checked as boolean)}
								disabled={isProcessing}
							/>
							<div className="grid gap-1.5 leading-none">
								<label
									htmlFor="force-summary"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Force Summary Generation
								</label>
								<p className="text-sm text-muted-foreground">
									When checked, summaries will be generated for all proposals,
									even if no new feedback was submitted.
								</p>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
				</div>
			) : (
				results.length > 0 && <ProcessingResultsTable results={results} />
			)}
		</div>
	)
}
