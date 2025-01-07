export interface Proposal {
  id: number
  proposalName: string
  reviewerVoteCount: number
  status: string
  budgetRequest: number
  author: {
    username: string
    authType: "discord" | "wallet"
    id: string
  }
  reviewerVotes: {
    approved: number
    rejected: number
    total: number
  }
  communityVotes: {
    positiveStakeWeight: string
    totalVotes: number
  }
}

export interface ProposalWithUniqueId extends Proposal {
  uniqueId: string
}

