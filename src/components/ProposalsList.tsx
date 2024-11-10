'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Proposal } from "@prisma/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useActionFeedback } from '@/hooks/use-action-feedback'

interface ProposalWithUser extends Proposal {
  user: {
    id: string;
    linkId: string;
    metadata: {
      username: string;
      authSource: {
        type: string;
        id: string;
        username: string;
      };
    };
  };
}

export function ProposalsList() {
  const { toast } = useToast()
  const [proposals, setProposals] = useState<ProposalWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { handleAction, loading: deleteLoading } = useActionFeedback({
    successMessage: "Proposal deleted successfully",
    errorMessage: "Failed to delete proposal",
    requireConfirmation: true,
    confirmMessage: "Are you sure you want to delete this proposal? This action cannot be undone."
  })

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/proposals')
      if (!response.ok) throw new Error('Failed to fetch proposals')
      const data = await response.json()
      setProposals(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await handleAction(async () => {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete proposal')
      }

      setProposals(prev => prev.filter(p => p.id !== id))
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading proposals...</div>
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No proposals found</p>
        <Link href="/proposals/create">
          <Button>Create your first proposal</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Proposals</h1>
        <Link href="/proposals/create">
          <Button className="bg-gray-600 text-white hover:bg-gray-700">
            Create a proposal
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-background"
          >
            <div className="flex flex-col">
              <Link
                href={`/proposals/${proposal.id}`}
                className="text-lg font-medium hover:underline"
              >
                {proposal.proposalName}
              </Link>
              <span className="text-sm text-muted-foreground">
                by {proposal.user.metadata.username} • Status: {proposal.status.toLowerCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {proposal.status === 'DRAFT' && (
                <Link
                  href={`/proposals/${proposal.id}/edit`}
                  className="text-muted-foreground hover:text-foreground underline"
                >
                  Edit
                </Link>
              )}
              
              {proposal.status === 'DRAFT' && (
                <Button
                  variant="secondary"
                  className="bg-muted hover:bg-muted/80"
                  onClick={() => toast({
                    description: "Submitting to funding round will be implemented soon"
                  })}
                >
                  Submit to funding round
                </Button>
              )}
              
              {proposal.status === 'DRAFT' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(proposal.id)}
                  disabled={deleteLoading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {deleteLoading ? (
                    <span className="animate-spin">⌛</span>
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                  <span className="sr-only">Delete proposal</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your proposal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}