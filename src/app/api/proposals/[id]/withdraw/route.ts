import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import logger from "@/logging";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getOrCreateUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposalId = parseInt((await context.params).id);

    // Verify the proposal belongs to the user or a linked user
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        user: true, // Include user to get linkId
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check if user has access (is creator or has same linkId)
    const hasAccess =
      proposal.userId === user.id || proposal.user?.linkId === user.linkId;

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the proposal
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        fundingRoundId: null,
        status: "WITHDRAWN",
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    logger.error("Failed to withdraw proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
