import { type FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type ProposalVoteBase, type ReviewerVoteStats, type CommunityVoteStats, type SubmissionProposalVote } from '@/types/phase-summary';
import { ProposalCard } from './ProposalCard';

type ProposalVote = 
  | (ProposalVoteBase & {
      reviewerVotes: ReviewerVoteStats;
      communityVotes?: CommunityVoteStats;
    })
  | SubmissionProposalVote;

interface Props {
  title: string;
  proposals: ProposalVote[];
  showCommunityVotes?: boolean;
}

export const ProposalList: FC<Props> = ({
  title,
  proposals,
  showCommunityVotes = false
}) => {
  // Sort proposals by yes votes in descending order for review phases
  // or by submission date for submission phase
  const sortedProposals = [...proposals].sort((a, b) => {
    if ('submissionDate' in a && 'submissionDate' in b) {
      return b.submissionDate.getTime() - a.submissionDate.getTime();
    }
    if ('reviewerVotes' in a && 'reviewerVotes' in b) {
      return b.reviewerVotes.yesVotes - a.reviewerVotes.yesVotes;
    }
    return 0;
  });

  const leftColumnProposals = sortedProposals.slice(0, Math.ceil(sortedProposals.length / 2));
  const rightColumnProposals = sortedProposals.slice(Math.ceil(sortedProposals.length / 2));

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 pr-4">
            {/* Left Column */}
            <div className="space-y-4">
              {leftColumnProposals.map((proposal, index) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  rank={index + 1}
                  showCommunityVotes={showCommunityVotes}
                />
              ))}
            </div>
            {/* Right Column */}
            <div className="space-y-4">
              {rightColumnProposals.map((proposal, index) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  rank={Math.ceil(sortedProposals.length / 2) + index + 1}
                  showCommunityVotes={showCommunityVotes}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}; 