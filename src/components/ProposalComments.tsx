'use client'

import { useMemo, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  BadgeCheck,
  CircleUserRound,
  Clock,
  ShieldCheck,
  ArrowUpDown,
  Users
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import type { CategorizedComments, ProposalComment } from "@/types/deliberation"


interface ProposalCommentsProps {
  comments: CategorizedComments;
}

type SortOrder = 'asc' | 'desc';
type SortType = 'date' | 'reviewer';

export function ProposalComments({ comments }: ProposalCommentsProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [sortType, setSortType] = useState<SortType>('date');

  const sortedComments = useMemo(() => {
    // Combine all comments into a single array
    const allComments = [
      ...(comments.reviewerConsideration || []).map(c => ({ ...c, category: 'reviewerConsideration' as const })),
      ...(comments.reviewerDeliberation || []).map(c => ({ ...c, category: 'reviewerDeliberation' as const })),
      ...(comments.communityDeliberation || []).map(c => ({ ...c, category: 'communityDeliberation' as const })),
    ];

    if (sortType === 'date') {
      return allComments.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else {
      // Sort by reviewer status (reviewer comments first)
      return allComments.sort((a, b) => {
        if (a.isReviewerComment === b.isReviewerComment) {
          // If same type, sort by date
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Always newest first within same type
        }
        // Reviewers always first when sorting by reviewer
        return a.isReviewerComment ? -1 : 1;
      });
    }
  }, [comments, sortOrder, sortType]);

  const toggleSortOrder = () => {
    if (sortType === 'reviewer') {
      // Switch to date sorting when changing order
      setSortType('date');
    }
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const toggleSortType = () => {
    setSortType(prev => prev === 'date' ? 'reviewer' : 'date');
    // When switching to reviewer sort, always set to desc order
    if (sortType === 'date') {
      setSortOrder('desc');
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Comments & Deliberations</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-2"
            disabled={sortType === 'reviewer'}
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortType === 'reviewer' ? 'Reviewer First' : 
             sortOrder === 'asc' ? 'Oldest First' : 'Latest First'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortType}
            className="flex items-center gap-2"
          >
            {sortType === 'date' ? (
              <>
                <Users className="h-4 w-4" />
                Show Reviewer First
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Sort by Date
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
        {sortedComments.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No comments yet
          </p>
        )}
      </div>
    </div>
  );
}

function truncateUsername(username: string, maxLength: number = 20): { truncated: string; isShortened: boolean } {
  if (username.length <= maxLength) {
    return { truncated: username, isShortened: false };
  }

  const start = Math.floor((maxLength - 3) / 2);
  const end = username.length - start;
  return {
    truncated: `${username.slice(0, start)}...${username.slice(end)}`,
    isShortened: true
  };
}

function CommentCard({ comment }: { comment: ProposalComment & { category: 'reviewerConsideration' | 'reviewerDeliberation' | 'communityDeliberation' } }) {
  const { truncated: displayUsername, isShortened } = comment.reviewer ? 
    truncateUsername(comment.reviewer.username) : 
    { truncated: '', isShortened: false };

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
                        {displayUsername}
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
                    {isShortened && (
                      <p className="text-sm text-muted-foreground break-all">
                        Full username: {comment.reviewer?.username}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      This comment is from a verified expert reviewer for this proposal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-medium">Anonymous Community Member</p>
                    <p className="text-sm text-muted-foreground">
                      Community members&lsquo; identities are kept anonymous to ensure unbiased deliberation.
                    </p>
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex flex-col items-end gap-2">
          {comment.recommendation !== undefined && (
            <Badge 
              variant={comment.recommendation ? null : 'destructive'}
              className="transition-all duration-200 hover:opacity-90"
            >
              {comment.recommendation 
                ? <span className="flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Approved
                  </span>
                : <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Rejected
                  </span>
              }
            </Badge>
          )}
          <Badge 
            variant="outline"
            className={cn(
              "transition-all duration-200",
              comment.category === 'reviewerConsideration'
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400"
                : "bg-gray-50 text-gray-700 dark:bg-gray-900/10 dark:text-gray-400"
            )}
          >
            {comment.category === 'reviewerConsideration' 
              ? "Consideration"
              : "Deliberation"
            }
          </Badge>
        </div>
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