import { type FC } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThumbsUpIcon, ThumbsDownIcon, HashIcon, CoinsIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  type ProposalVoteBase, 
  type ReviewerVoteStats, 
  type CommunityVoteStats, 
  type SubmissionProposalVote,
  type VotingProposalVote 
} from '@/types/phase-summary';
import { formatMINA } from '@/lib/format';

type ProposalVote = 
  | (ProposalVoteBase & {
      reviewerVotes: ReviewerVoteStats;
      communityVotes?: CommunityVoteStats;
    })
  | SubmissionProposalVote
  | VotingProposalVote;

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
  return position.toString();
};

const getProposalStatus = (proposal: ProposalVote) => {
  const isSubmissionPhase = 'submissionDate' in proposal;
  const isVotingPhase = 'isFunded' in proposal;
  const isDraft = proposal.status === 'DRAFT';
  
  if (isVotingPhase) {
    return (proposal as VotingProposalVote).isFunded ? {
      label: 'Funded',
      bgColor: 'bg-emerald-50/50 hover:bg-emerald-50/80',
      borderColor: 'border-emerald-200/50',
      textColor: 'text-emerald-600'
    } : {
      label: 'Not Funded',
      bgColor: 'bg-rose-50/50 hover:bg-rose-50/80',
      borderColor: 'border-rose-200/50',
      textColor: 'text-rose-600'
    };
  }
  
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
  const isVotingPhase = 'isFunded' in proposal;
  
  return (
    <Link 
      href={`/proposals/${proposal.id}`}
      className="block"
    >
      <div 
        className={cn(
          "group flex flex-col gap-2 p-3 rounded-lg border transition-all h-[120px]",
          "hover:shadow-md",
          status.bgColor,
          status.borderColor
        )}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-base flex-shrink-0" aria-label={`Rank ${rank}`}>
              {getEmojiRank(rank)}
            </span>
            <div className="min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {proposal.proposalName}
                  </h3>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px]">
                  <p className="whitespace-normal">{proposal.proposalName}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-muted-foreground truncate">
                    {proposal.proposer}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{proposal.proposer}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-normal whitespace-nowrap flex-shrink-0",
              status.textColor,
              status.borderColor
            )}
          >
            {status.label}
          </Badge>
        </div>

        {/* Middle Content */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            {isSubmissionPhase ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon className="h-3 w-3" />
                <span>{format(proposal.submissionDate, 'MMM dd, yyyy')}</span>
              </div>
            ) : isVotingPhase ? (
              <div className="flex-1 space-y-2">
                {(proposal as VotingProposalVote).missingAmount && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-rose-600">
                        Missing: {Math.floor((proposal as VotingProposalVote).missingAmount!)} MINA
                      </span>
                    </div>
                    <Progress
                      value={(1 - (proposal as VotingProposalVote).missingAmount! / proposal.budgetRequest.toNumber()) * 100}
                      className={cn(
                        "h-1.5 bg-rose-100",
                        "[&>div]:bg-emerald-500"
                      )}
                    />
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1 text-emerald-600">
                  <ThumbsUpIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">{proposal.reviewerVotes.yesVotes}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-600">
                  <ThumbsDownIcon className="h-3 w-3" />
                  <span className="text-xs font-medium">{proposal.reviewerVotes.noVotes}</span>
                </div>
                {showCommunityVotes && proposal.communityVotes && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1 text-primary">
                      <UsersIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">{proposal.communityVotes.positive}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({proposal.communityVotes.positiveStakeWeight})
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <HashIcon className="h-3 w-3" />
              <span>{proposal.id}</span>
            </div>
            <div className="flex items-center gap-1">
              <CoinsIcon className="h-3 w-3" />
              <span>{proposal.budgetRequest.toNumber()} MINA</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}; 