'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useToast } from "@/hooks/use-toast"
import type { Proposal } from "@prisma/client"
import { useActionFeedback } from '@/hooks/use-action-feedback'

interface ProposalWithAccess extends Proposal {
  canEdit: boolean;
  canDelete: boolean;
  user: {
    metadata: {
      username: string;
    };
  };
}

interface Props {
  proposalId: string;
}

export function ProposalDetails({ proposalId }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isExpanded, setIsExpanded] = useState(false)
  const [proposal, setProposal] = useState<ProposalWithAccess | null>(null)
  const [loading, setLoading] = useState(true)

  const { handleAction } = useActionFeedback({
    successMessage: "Action will be implemented soon",
    errorMessage: "Failed to perform action"
  })

  const handleSubmitToFunding = async () => {
    await handleAction(async () => {
      // Placeholder for future implementation
      throw new Error("This feature will be implemented soon")
    })
  }

  useEffect(() => {
    fetchProposal()
  }, [proposalId])

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`)
      if (!response.ok) throw new Error('Failed to fetch proposal')
      const data = await response.json()
      setProposal(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load proposal",
        variant: "destructive"
      })
      router.push('/proposals')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading proposal...</div>
  }

  if (!proposal) {
    return <div className="text-center py-8">Proposal not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Proposal Details</h1>
        <Link href="/proposals" className="text-muted-foreground hover:text-foreground underline">
          Back to proposals list
        </Link>
      </div>

      <div className="border rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{proposal.proposalName}</h2>
          <p className="text-muted-foreground">by {proposal.user.metadata.username}</p>
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded-full bg-muted text-sm">
              Status: {proposal.status.toLowerCase()}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Abstract</h3>
            <p className="text-muted-foreground">{proposal.abstract}</p>
          </div>

          {isExpanded && (
            <>
              <div>
                <h3 className="text-xl font-semibold mb-2">Motivation</h3>
                <p className="text-muted-foreground">{proposal.motivation}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Rationale</h3>
                <p className="text-muted-foreground">{proposal.rationale}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Delivery requirements</h3>
                <p className="text-muted-foreground">{proposal.deliveryRequirements}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Security and Performance considerations</h3>
                <p className="text-muted-foreground">{proposal.securityAndPerformance}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Budget request</h3>
                <p className="text-muted-foreground">{proposal.budgetRequest.toString()} MINA</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
                <p className="text-muted-foreground">Discord: {proposal.discord}</p>
                <p className="text-muted-foreground">Email: {proposal.email}</p>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                See less
                <ChevronUpIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                See more
                <ChevronDownIcon className="h-4 w-4" />
              </>
            )}
          </Button>

          {proposal.status === 'DRAFT' && (
            <div className="flex gap-4">
              {proposal.canEdit && (
                <Link href={`/proposals/${proposal.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              )}
              <Button
                onClick={handleSubmitToFunding}
                disabled={loading}
              >
                Submit to funding round
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}