'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { Icons } from '@/components/ui/icons'
import Image from 'next/image'

export function FeedbackDialog() {
	const [isOpen, setIsOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isTakingScreenshot, setIsTakingScreenshot] = useState(false)
	const [isPreviewOpen, setIsPreviewOpen] = useState(false)
	const [feedback, setFeedback] = useState('')
	const [screenshot, setScreenshot] = useState<string | null>(null)
	const formRef = useRef<HTMLFormElement>(null)
	const { toast } = useToast()
	const { user } = useAuth()

	if (!user) return null

	const handleScreenshot = async () => {
		try {
			setIsTakingScreenshot(true)
			setIsOpen(false) // Hide dialog while taking screenshot

			// Request screen capture with specific display surface
			const stream = await navigator.mediaDevices.getDisplayMedia({
				preferCurrentTab: true,
				video: {
					displaySurface: 'browser',
					selfBrowserSurface: 'include',
				},
			} as DisplayMediaStreamOptions)

			const video = document.createElement('video')
			video.srcObject = stream
			await video.play()

			const canvas = document.createElement('canvas')
			canvas.width = video.videoWidth
			canvas.height = video.videoHeight

			const ctx = canvas.getContext('2d')
			ctx?.drawImage(video, 0, 0)

			// Stop all tracks
			stream.getTracks().forEach(track => track.stop())

			// Convert to base64 for preview
			const base64Image = canvas.toDataURL('image/png')
			setScreenshot(base64Image)

			// Convert to File for form submission
			canvas.toBlob(blob => {
				if (blob) {
					const file = new File([blob], 'screenshot.png', { type: 'image/png' })
					const screenshotInput = formRef.current?.querySelector(
						'input[name="screenshot"]',
					) as HTMLInputElement
					if (screenshotInput) {
						screenshotInput.files = createFileList([file])
					}
				}
			}, 'image/png')
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to take screenshot. Please try again.',
				variant: 'destructive',
			})
		} finally {
			setIsTakingScreenshot(false)
			setIsOpen(true)
		}
	}

	// Helper function to create a FileList
	const createFileList = (files: File[]) => {
		const dataTransfer = new DataTransfer()
		files.forEach(file => dataTransfer.items.add(file))
		return dataTransfer.files
	}

	const handleRemoveScreenshot = () => {
		setScreenshot(null)
		const screenshotInput = formRef.current?.querySelector(
			'input[name="screenshot"]',
		) as HTMLInputElement
		if (screenshotInput) {
			screenshotInput.value = ''
		}
	}

	const handlePreviewClick = () => {
		setIsPreviewOpen(true)
	}

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!feedback.trim()) return

		try {
			setIsSubmitting(true)
			const formData = new FormData()
			formData.append('feedback', feedback)

			if (screenshot) {
				// Convert base64 to blob
				const base64Response = await fetch(screenshot)
				const blob = await base64Response.blob()
				formData.append('image', blob, 'screenshot.png')
			}

			// Get the current URL from the browser
			const currentUrl = window.location.href
			const metadata = {
				url: currentUrl,
				userAgent: window.navigator.userAgent,
				timestamp: new Date().toISOString(),
				pathname: window.location.pathname,
				search: window.location.search,
			}

			formData.append('metadata', JSON.stringify(metadata))

			const response = await fetch('/api/me/feedback', {
				method: 'POST',
				body: formData,
			})

			if (!response.ok) throw new Error('Failed to submit feedback')

			toast({
				title: 'Feedback submitted',
				description: 'Thank you for your feedback!',
			})

			setFeedback('')
			setScreenshot(null)
			setIsOpen(false)
		} catch (error) {
			console.error('Error submitting feedback:', error)
			toast({
				title: 'Error',
				description: 'Failed to submit feedback. Please try again.',
				variant: 'destructive',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
					>
						<Icons.messageSquare className="h-6 w-6" />
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Send Feedback</DialogTitle>
						<DialogDescription>
							Help us improve by sharing your thoughts. You can optionally
							include a screenshot.
						</DialogDescription>
					</DialogHeader>
					<form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
						<Textarea
							name="feedback"
							placeholder="What's on your mind?"
							value={feedback}
							onChange={e => setFeedback(e.target.value)}
							className="min-h-[100px] resize-none"
							required
						/>

						<div className="flex items-center justify-between gap-4">
							<div className="flex-1">
								{screenshot ? (
									<div className="flex items-center gap-2">
										<div
											className="flex flex-1 cursor-pointer items-center gap-2 rounded-md bg-muted px-3 py-2 transition-colors hover:bg-muted/80"
											onClick={handlePreviewClick}
										>
											<Icons.image className="h-4 w-4 shrink-0 text-muted-foreground" />
											<span className="truncate text-sm">
												Screenshot attached
											</span>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-9 w-9 shrink-0"
											onClick={handleRemoveScreenshot}
										>
											<Icons.x className="h-4 w-4" />
											<span className="sr-only">Remove screenshot</span>
										</Button>
									</div>
								) : (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleScreenshot}
										disabled={isTakingScreenshot}
										className="gap-2"
									>
										{isTakingScreenshot ? (
											<>
												<Icons.loader className="h-4 w-4 animate-spin" />
												<span>Taking Screenshot...</span>
											</>
										) : (
											<>
												<Icons.camera className="h-4 w-4" />
												<span>Add Screenshot</span>
											</>
										)}
									</Button>
								)}
							</div>

							<Button
								type="submit"
								disabled={isSubmitting || !feedback.trim()}
								className="shrink-0"
							>
								{isSubmitting ? (
									<>
										<Icons.loader className="mr-2 h-4 w-4 animate-spin" />
										Sending...
									</>
								) : (
									'Send Feedback'
								)}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>

			{/* Screenshot Preview Dialog */}
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogContent className="max-h-[90vh] max-w-[90vw]">
					<DialogHeader>
						<DialogTitle>Screenshot Preview</DialogTitle>
						<DialogDescription>
							Review your screenshot before submitting
						</DialogDescription>
					</DialogHeader>
					{screenshot && (
						<div className="relative h-[80vh] w-full">
							<Image
								src={screenshot}
								alt="Screenshot preview"
								fill
								className="object-contain"
							/>
						</div>
					)}
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
							Close
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
