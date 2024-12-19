import { ProposalStatus } from '@prisma/client';

export interface ConsiderationVoteStats {
  approved: number;
  rejected: number;
  total: number;
  communityVotes: {
    total: number;
    positive: number;
    positiveStakeWeight: string;
    isEligible: boolean;
    voters: Array<{
      address: string;
      timestamp: number;
    }>;
  };
  reviewerEligible: boolean;
  requiredReviewerApprovals: number;
}

export interface ConsiderationUserVote {
  decision: 'APPROVED' | 'REJECTED';
  feedback: string;
}

export interface ConsiderationProposal {
  id: number;
  proposalName: string;
  submitter: string;
  abstract: string;
  status: 'pending' | 'approved' | 'rejected';
  userVote?: ConsiderationUserVote;
  isReviewerEligible?: boolean;
  voteStats: ConsiderationVoteStats;
  createdAt: Date;
  currentPhase: ProposalStatus;
}

export interface OCVVote {
  account: string;
  timestamp: number;
}

export interface OCVVoteData {
  total_community_votes: number;
  total_positive_community_votes: number;
  positive_stake_weight: string;
  elegible: boolean;
  votes: OCVVote[];
}
 