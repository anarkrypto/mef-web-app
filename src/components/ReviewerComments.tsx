import { useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  BadgeCheck,
  CircleUserRound,
  MessageCircle, 
  Clock,
  ShieldCheck,
  HelpCircle
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { DeliberationComment } from "@/types/deliberation"

interface ReviewerCommentsProps {
  comments: DeliberationComment[]
  newComment?: DeliberationComment
}

export function ReviewerComments({ comments, newComment }: ReviewerCommentsProps) {
  const allComments = useMemo(() => {
    const combinedComments = newComment 
      ? [...comments, newComment]
      : comments;

    // Remove any potential duplicates based on ID and user
    const uniqueComments = combinedComments.reduce((acc, current) => {
      const isDuplicate = acc.some(comment => 
        comment.id === current.id || 
        (comment.isReviewerComment && current.isReviewerComment && 
         comment.reviewer?.username === current.reviewer?.username) ||
        (!comment.isReviewerComment && current.id === comment.id)  // Changed this condition
      );

      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, [] as DeliberationComment[]);

    // Sort by date, newest first
    return uniqueComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments, newComment]);

  // Group comments by type for better organization
  const groupedComments = useMemo(() => {
    const reviewerComments = allComments.filter(c => c.isReviewerComment);
    const communityComments = allComments.filter(c => !c.isReviewerComment);
    return { reviewerComments, communityComments };
  }, [allComments]);

  return (
    <div className="mt-6 space-y-4">
      <h4 className="font-medium">Comments & Deliberations</h4>
      <div className="space-y-6">
        {groupedComments.reviewerComments.length > 0 && (
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-muted-foreground">Reviewer Comments</h5>
            {groupedComments.reviewerComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
        
        {groupedComments.communityComments.length > 0 && (
          <div className="space-y-4">
            <h5 className="text-sm font-medium text-muted-foreground">Community Deliberations</h5>
            {groupedComments.communityComments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted comment card component for better organization
function CommentCard({ comment }: { comment: DeliberationComment }) {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border transition-all duration-200 hover:shadow-sm",
        comment.recommendation !== undefined
          ? comment.recommendation 
            ? "border-green-500/20 bg-green-50/50 dark:bg-green-900/10 hover:border-green-500/30"
            : "border-red-500/20 bg-red-50/50 dark:bg-red-900/10 hover:border-red-500/30"
          : "border-gray-200 bg-gray-50/50 dark:bg-gray-900/10 hover:border-gray-300"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {comment.isReviewerComment ? (
                    <>
                      <div className="relative flex items-center">
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="font-medium flex items-center gap-1.5">
                        {comment.reviewer?.username}
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="relative flex items-center">
                        <CircleUserRound className="h-5 w-5 text-gray-400" />
                      </div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Anonymous Community Member
                      </span>
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px] p-3">
                {comment.isReviewerComment ? (
                  <div className="space-y-1">
                    <p className="font-medium">Verified Expert Reviewer</p>
                    <p className="text-sm text-muted-foreground">
                      This comment is from a verified expert reviewer for this proposal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium">Anonymous Community Member</p>
                    <p className="text-sm text-muted-foreground">
                      Community members&lsquo;identities are kept anonymous to ensure unbiased deliberation.
                    </p>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {comment.recommendation !== undefined && (
          <Badge 
            variant={comment.recommendation ? 'default' : 'destructive'}
            className="transition-all duration-200 hover:opacity-90"
          >
            {comment.recommendation 
              ? <span className="flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Recommended
                </span>
              : <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Not Recommended
                </span>
            }
          </Badge>
        )}
      </div>
      <div className="pl-6">
        <p className="text-muted-foreground whitespace-pre-wrap">
          {comment.feedback}
        </p>
        <div className="mt-2 text-xs text-muted-foreground/80 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {new Date(comment.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
} 