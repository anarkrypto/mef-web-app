import type { ConsiderationProposal } from './consideration'

export interface DeliberationComment {
  id: string;
  feedback: string;
  recommendation: boolean;
  createdAt: Date;
  reviewer: {
    username: string;
  };
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