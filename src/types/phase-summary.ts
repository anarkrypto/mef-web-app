import { Decimal } from '@prisma/client/runtime/library';
import { ProposalStatus } from '@prisma/client';

export interface PhaseTimeInfo {
  startDate: Date;
  endDate: Date;
}

export interface CommunityVoteStats {
  positive: number;
  positiveStakeWeight: number;
  voters: Array<{
    address: string;
    timestamp: number;
  }>;
  isEligible: boolean;
}

export interface ProposalVoteBase {
  id: number;
  proposalName: string;
  proposer: string;
  status: ProposalStatus;
  budgetRequest: Decimal;
}

export interface ReviewerVoteStats {
  yesVotes: number;
  noVotes: number;
  total: number;
  requiredReviewerApprovals: number;
  reviewerEligible: boolean;
}

export interface ConsiderationProposalVote extends ProposalVoteBase {
  reviewerVotes: ReviewerVoteStats;
  communityVotes: CommunityVoteStats;
}

export interface DeliberationProposalVote extends ProposalVoteBase {
  reviewerVotes: ReviewerVoteStats;
}

export interface BudgetBreakdown {
  small: number;
  medium: number;
  large: number;
}

export interface BasePhaseSummary {
  fundingRoundName: string;
  phaseTimeInfo: PhaseTimeInfo;
  totalProposals: number;
  budgetBreakdown: BudgetBreakdown;
}

export interface ConsiderationPhaseSummary extends BasePhaseSummary {
  proposalVotes: ConsiderationProposalVote[];
  movedForwardProposals: number;
  notMovedForwardProposals: number;
}

export interface DeliberationPhaseSummary extends BasePhaseSummary {
  proposalVotes: DeliberationProposalVote[];
  recommendedProposals: number;
  notRecommendedProposals: number;
}

export interface SubmissionProposalVote extends ProposalVoteBase {
  submissionDate: Date;
}

export interface SubmissionPhaseSummary extends BasePhaseSummary {
  proposalVotes: SubmissionProposalVote[];
  submittedProposals: number;
  draftProposals: number;
}

export interface VotingProposalVote extends ProposalVoteBase {
  isFunded: boolean;
  missingAmount?: number;
}

export interface VotingPhaseSummary extends BasePhaseSummary {
  proposalVotes: VotingProposalVote[];
  fundedProposals: number;
  notFundedProposals: number;
  totalBudget: number;
  remainingBudget: number;
}

export type PhaseStatus = 'not-started' | 'ongoing' | 'ended';

export interface PhaseStatusInfo {
  status: PhaseStatus;
  text: string;
  badge: 'default' | 'secondary';
  progressColor: string;
} 