'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { CreateProposal } from './CreateProposal'
import type { ProposalWithAccess } from '@/types/proposals'
import { useFeedback } from '@/contexts/FeedbackContext'
import { ProposalStatus } from '@prisma/client'

interface Props {
	proposalId: string
}

export function ProposalEditForm({ proposalId }: Props) {
	const router = useRouter()
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [proposal, setProposal] = useState<ProposalWithAccess | null>(null)
	const { error: showError } = useFeedback()

	useEffect(() => {
		async function fetchProposal() {
			try {
				const response = await fetch(`/api/proposals/${proposalId}`)
				if (!response.ok) {
					throw new Error('Failed to fetch proposal')
				}
				const data = await response.json()

				const canEdit: boolean =
					data.isOwner && data.status === ProposalStatus.DRAFT

				if (!canEdit) {
					showError('Only your draft proposals can be edited')
					router.push('/proposals')
					return
				}

				setProposal(data)
			} catch (error) {
				setError('Failed to load proposal')
				showError('Failed to load proposal')
				router.push('/proposals')
			} finally {
				setLoading(false)
			}
		}

		fetchProposal()
	}, [proposalId, router, showError])

	if (loading) {
		return <div className="py-8 text-center">Loading proposal...</div>
	}

	if (error) {
		return <div className="py-8 text-center text-red-500">{error}</div>
	}

	if (!proposal) {
		return <div className="py-8 text-center">Proposal not found</div>
	}

	return <CreateProposal mode="edit" proposalId={proposalId} />
}
