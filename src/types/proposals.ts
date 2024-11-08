import type { Proposal as PrismaProposal } from "@prisma/client";

export type ProposalField =
  | "proposalName"
  | "abstract"
  | "motivation"
  | "rationale"
  | "deliveryRequirements"
  | "securityAndPerformance"
  | "budgetRequest"
  | "discord"
  | "email";

export interface ProposalWithUser extends PrismaProposal {
  user: {
    id: string;
    linkId: string;
    metadata: {
      username: string;
      authSource: {
        type: string;
        id: string;
        username: string;
      };
    };
  };
}

export interface ProposalWithAccess extends ProposalWithUser {
  canEdit: boolean;
  canDelete: boolean;
}
