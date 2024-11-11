import { NextResponse } from "next/server";
import { ProposalService } from "@/services/ProposalService";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { ZodError } from "zod";

const proposalService = new ProposalService(prisma);

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to view proposals" },
        { status: 401 }
      );
    }

    const proposal = await proposalService.getProposalById(
      params.id,
      user.id,
      user.linkId
    );

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Failed to get proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to delete proposals" },
        { status: 401 }
      );
    }

    await proposalService.deleteProposal(params.id, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to update proposals" },
        { status: 401 }
      );
    }

    const data = await req.json();

    // Verify user can edit this proposal
    const existing = await proposalService.getProposalById(
      params.id,
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
    const updated = await proposalService.updateProposal(params.id, data);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update proposal:", error);

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
