import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { Proposal, Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface UserMetadata {
  username: string;
  createdAt: string;
  authSource: {
    type: string;
    id: string;
    username: string;
  };
}

interface ProposalWithUser extends Proposal {
  user: {
    metadata: UserMetadata;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fundingRoundId = (await context.params).id;

    const proposals = await prisma.proposal.findMany({
      where: {
        fundingRoundId,
        status: 'CONSIDERATION',
      },
      select: {
        id: true,
        proposalName: true,
        abstract: true,
        user: {
          select: {
            metadata: true
          }
        }
      }
    });

    // Transform the data to match the expected format with proper typing
    const formattedProposals = proposals.map(p => ({
      id: p.id,
      proposalName: p.proposalName,
      submitter: (p.user.metadata as unknown as UserMetadata).username,
      abstract: p.abstract,
      status: 'pending' as const,
    }));

    return NextResponse.json(formattedProposals);
  } catch (error) {
    console.error("Failed to fetch consideration proposals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 