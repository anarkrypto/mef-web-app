import { NextResponse } from "next/server";
import { ProposalService } from "@/services/ProposalService";
import prisma from "@/lib/prisma";
import { getOrCreateUserFromRequest } from "@/lib/auth";
import { ZodError } from "zod";
import logger from "@/logging";
import { ApiResponse } from '@/lib/api-response';
import { AppError } from '@/lib/errors';
import { AuthErrors } from '@/constants/errors';

const proposalService = new ProposalService(prisma);

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getOrCreateUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: parseInt((await context.params).id) },
      include: {
        user: true,
        fundingRound: {
          include: {
            considerationPhase: true,
            deliberationPhase: true,
            votingPhase: true,
          },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Check if user is owner or linked user
    const isOwner = proposal.userId === user.id || proposal.user.linkId === user.linkId;

    // Add access control flags
    const response = {
      ...proposal,
      isOwner, 
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Failed to fetch proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUserFromRequest(req);
    if (!user) {
      throw AppError.unauthorized(AuthErrors.UNAUTHORIZED);
    }

    await proposalService.deleteProposal(
      parseInt((await params).id), 
      user.id,
      user.linkId
    );

    return ApiResponse.success({ success: true });
  } catch (error) {
    return ApiResponse.error(error);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to update proposals" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Verify user can edit this proposal
    const existing = await proposalService.getProposalById(
      parseInt((await params).id),
      user.id,
      user.linkId
    );

    if (!existing) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    if (!existing.canEdit) {
      return NextResponse.json(
        { error: "You cannot edit this proposal" },
        { status: 403 }
      );
    }

    // Update proposal
    const updated = await proposalService.updateProposal(
      parseInt((await params).id),
      data
    );

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to update proposal:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
