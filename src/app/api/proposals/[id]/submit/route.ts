import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposalId = parseInt((await context.params).id);
    const { fundingRoundId } = await request.json();

    // Verify the proposal belongs to the user
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    if (proposal.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the funding round exists and is in consideration phase
    const fundingRound = await prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
      include: {
        considerationPhase: true,
      },
    });

    if (!fundingRound) {
      return NextResponse.json(
        { error: "Funding round not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const considerationStart = new Date(
      fundingRound.considerationPhase!.startDate
    );
    const considerationEnd = new Date(fundingRound.considerationPhase!.endDate);

    if (now < considerationStart || now > considerationEnd) {
      return NextResponse.json(
        { error: "Funding round is not in consideration phase" },
        { status: 400 }
      );
    }

    // Update the proposal
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        fundingRoundId,
        status: "CONSIDERATION",
      },
      include: {
        fundingRound: {
          include: {
            considerationPhase: true,
            deliberationPhase: true,
            votingPhase: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error("Failed to submit proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
