'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useDeliberationVote } from '@/hooks'
import type { DeliberationVote } from '@/types/deliberation'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalId: number;
  isReviewer: boolean;
  mode: 'recommend' | 'not-recommend' | 'community';
  existingVote?: DeliberationVote;
  onSubmit: (feedback: string, recommendation?: boolean) => Promise<void>;
}

export function DeliberationDialog({
  open,
  onOpenChange,
  proposalId,
  isReviewer,
  mode,
  existingVote,
  onSubmit
}: Props) {
  const [feedback, setFeedback] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { submitVote, isLoading } = useDeliberationVote()
  const [currentRecommendation, setCurrentRecommendation] = useState<boolean | undefined>()

  // Initialize with existing vote data or from mode
  useEffect(() => {
    if (open) {
      if (existingVote) {
        setFeedback(existingVote.feedback)
        setCurrentRecommendation(existingVote.recommendation)
      } else {
        setFeedback('')
        setCurrentRecommendation(mode === 'recommend' ? true : mode === 'not-recommend' ? false : undefined)
      }
    }
  }, [existingVote, open, mode])

  const handleSubmit = async () => {
    if (!feedback.trim()) return
    if (isReviewer && currentRecommendation === undefined) return

    // Check if anything changed when editing
    if (existingVote) {
      const hasChanges = feedback !== existingVote.feedback || 
        (isReviewer && currentRecommendation !== existingVote.recommendation)

      if (!hasChanges) {
        onOpenChange(false)
        return
      }

      setShowConfirmation(true)
      return
    }

    // For new votes, submit directly
    await onSubmit(feedback, isReviewer ? currentRecommendation : undefined)
    setFeedback('')
    onOpenChange(false)
  }

  const handleConfirmedSubmit = async () => {
    await onSubmit(feedback, isReviewer ? currentRecommendation : undefined)
    setFeedback('')
    setShowConfirmation(false)
    onOpenChange(false)
  }

  const getChangeSummary = () => {
    if (!existingVote) return ''

    const changes: string[] = []
    if (feedback !== existingVote.feedback) {
      changes.push('Updated feedback text')
    }

    if (isReviewer && currentRecommendation !== existingVote.recommendation) {
      changes.push(`Changed recommendation to ${currentRecommendation ? 'Recommend' : 'Not Recommend'}`)
    }

    return changes.join('\n')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {existingVote ? '✏️ Edit Your Deliberation' : ''}
           </DialogTitle>
            <DialogDescription>
              {existingVote 
                ? 'Edit your existing deliberation below.'
                : isReviewer 
                  ? 'Provide your recommendation and feedback for this proposal.'
                  : 'Share your thoughts on this proposal with the community.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {isReviewer && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={currentRecommendation ? 'default' : 'outline'}
                  className={cn(
                    "flex-1",
                    currentRecommendation && "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={() => setCurrentRecommendation(true)}
                >
                  ✅ Recommend
                </Button>
                <Button
                  type="button"
                  variant={currentRecommendation === false ? 'destructive' : 'outline'}
                  className="flex-1"
                  onClick={() => setCurrentRecommendation(false)}
                >
                  ❌ Not Recommend
                </Button>
              </div>
            )}
            <Textarea
              placeholder="Enter your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !feedback.trim() || (isReviewer && currentRecommendation === undefined)}
              variant={currentRecommendation ? 'default' : currentRecommendation === false ? 'destructive' : 'secondary'}
            >
              {isLoading ? 'Submitting...' : existingVote ? 'Update' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>Are you sure you want to update your {isReviewer ? 'review' : 'deliberation'}?</div>
                <div className="mt-2 rounded-md bg-muted p-4">
                  <div className="font-medium">Changes made:</div>
                  <pre className="mt-2 whitespace-pre-wrap text-sm">
                    {getChangeSummary()}
                  </pre>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>
              Confirm Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 