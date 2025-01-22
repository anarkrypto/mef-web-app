import type { ConsiderationProposal } from './consideration'

export interface DeliberationComment {
  id: string;
  feedback: string;
  recommendation?: boolean;
  createdAt: Date;
  reviewer?: {
    username: string;
  };
  isReviewerComment: boolean;
}

export interface DeliberationVote {
  feedback: string;
  recommendation?: boolean;
  createdAt: Date;
  isReviewerVote: boolean;
}

export interface DeliberationProposal extends ConsiderationProposal {
  reviewerComments: DeliberationComment[];
  userDeliberation?: DeliberationVote;
  hasVoted: boolean;
}

export interface ProposalComment {
  id: string;
  feedback: string;
  createdAt: Date;
  isReviewerComment: boolean;
  recommendation?: boolean;
  reviewer?: {
    username: string;
  };
}

export interface CategorizedComments {
  reviewerConsideration: ProposalComment[];
  reviewerDeliberation: ProposalComment[];
  communityDeliberation: ProposalComment[];
} 