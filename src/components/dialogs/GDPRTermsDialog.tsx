'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function GDPRTermsDialog({ open, onOpenChange }: Props) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>📜 GDPR Terms and Conditions</DialogTitle>
					<DialogDescription>
						Please review how we handle your personal data
					</DialogDescription>
				</DialogHeader>
				<ScrollArea className="h-[400px] pr-4">
					<div className="space-y-6 text-sm">
						<section>
							<h3 className="mb-2 font-semibold">1. 🔍 Data Collection</h3>
							<p className="mb-2">
								When you submit a proposal, we collect and process:
							</p>
							<ul className="list-disc space-y-1 pl-6">
								<li>Your Discord username</li>
								<li>Your email address</li>
								<li>Proposal content and metadata</li>
								<li>Submission timestamps</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-2 font-semibold">
								2. 🎯 Purpose of Processing
							</h3>
							<p>We process this data to:</p>
							<ul className="list-disc space-y-1 pl-6">
								<li>Manage your proposal submission</li>
								<li>Enable communication about your proposal</li>
								<li>Facilitate the review and voting process</li>
								<li>Maintain transparency in the funding process</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-2 font-semibold">3. 📊 Data Storage</h3>
							<p>Your data is:</p>
							<ul className="list-disc space-y-1 pl-6">
								<li>Retained for the duration of the funding round</li>
								<li>Archived for historical and audit purposes</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-2 font-semibold">4. 🔒 Your Rights</h3>
							<p>You have the right to:</p>
							<ul className="list-disc space-y-1 pl-6">
								<li>Access your personal data</li>
								<li>Request data correction</li>
								<li>Request data deletion (where applicable)</li>
								<li>Object to data processing</li>
								<li>Data portability</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-2 font-semibold">5. 📬 Contact</h3>
							<p>
								For any GDPR-related queries, contact our Data Protection
								Officer at:
							</p>
							<p className="pl-6">contact@minaprotocol.com</p>
						</section>
					</div>
				</ScrollArea>
				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
