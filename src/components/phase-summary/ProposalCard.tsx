import { type FC } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsUpIcon, ThumbsDownIcon, HashIcon, CoinsIcon, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type ProposalVoteBase, type ReviewerVoteStats, type CommunityVoteStats, type SubmissionProposalVote } from '@/types/phase-summary';

type ProposalVote = 
  | (ProposalVoteBase & {
      reviewerVotes: ReviewerVoteStats;
      communityVotes?: CommunityVoteStats;
    })
  | SubmissionProposalVote;

interface Props {
  proposal: ProposalVote;
  rank: number;
  showCommunityVotes?: boolean;
}

// Add number emoji mapping
const numberToEmoji: Record<string, string> = {
  '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
  '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
};

const getEmojiRank = (position: number): string => {
  return position.toString().split('').map(digit => numberToEmoji[digit]).join('');
};

const getProposalStatus = (proposal: ProposalVote) => {
  const isSubmissionPhase = 'submissionDate' in proposal;
  const isDraft = proposal.status === 'DRAFT';
  
  if (isSubmissionPhase) {
    return {
      label: 'Submitted',
      bgColor: 'bg-blue-50/50 hover:bg-blue-50/80',
      borderColor: 'border-blue-200/50',
      textColor: 'text-blue-600'
    };
  }
  
  if (isDraft) {
    return {
      label: 'Draft',
      bgColor: 'bg-gray-50/50 hover:bg-gray-50/80',
      borderColor: 'border-gray-200/50',
      textColor: 'text-gray-600'
    };
  }
  
  const hasMovedForward = ['DELIBERATION', 'VOTING', 'APPROVED'].includes(proposal.status);
  return hasMovedForward ? {
    label: 'Moving Forward',
    bgColor: 'bg-emerald-50/50 hover:bg-emerald-50/80',
    borderColor: 'border-emerald-200/50',
    textColor: 'text-emerald-600'
  } : {
    label: 'Not Moving Forward',
    bgColor: 'bg-rose-50/50 hover:bg-rose-50/80',
    borderColor: 'border-rose-200/50',
    textColor: 'text-rose-600'
  };
};

export const ProposalCard: FC<Props> = ({
  proposal,
  rank,
  showCommunityVotes = false
}) => {
  const status = getProposalStatus(proposal);
  const isSubmissionPhase = 'submissionDate' in proposal;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link 
          href={`/proposals/${proposal.id}`}
          className="block"
        >
          <div 
            className={cn(
              "group flex flex-col gap-2 p-4 rounded-lg border transition-all",
              "hover:shadow-md",
              status.bgColor,
              status.borderColor
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium" aria-label={`Rank ${rank}`}>
                    {getEmojiRank(rank)}
                  </span>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {proposal.proposalName}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-normal",
                      status.textColor,
                      status.borderColor
                    )}
                  >
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{proposal.proposer}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm">
                {isSubmissionPhase ? (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(proposal.submissionDate, 'MMM dd, yyyy')}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ThumbsUpIcon className="h-4 w-4" />
                        <span>{proposal.reviewerVotes.yesVotes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-rose-600">
                        <ThumbsDownIcon className="h-4 w-4" />
                        <span>{proposal.reviewerVotes.noVotes}</span>
                      </div>
                    </div>
                    {showCommunityVotes && proposal.communityVotes && (
                      <div className="flex items-center gap-1 text-primary">
                        <span className="text-xs">Community:</span>
                        <span className="font-medium">{proposal.communityVotes.positive}</span>
                        <span className="text-xs text-muted-foreground">
                          ({proposal.communityVotes.positiveStakeWeight} stake)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <HashIcon className="h-3 w-3" />
                <span>{proposal.id}</span>
              </div>
              <div className="flex items-center gap-1">
                <CoinsIcon className="h-3 w-3" />
                <span>{proposal.budgetRequest?.toNumber() ?? 0} MINA</span>
              </div>
            </div>
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click to view proposal details</p>
      </TooltipContent>
    </Tooltip>
  );
}; 