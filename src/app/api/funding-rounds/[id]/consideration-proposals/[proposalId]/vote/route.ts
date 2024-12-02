import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import logger from "@/logging";

const voteSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  feedback: z.string().min(1).max(1000),
});

async function checkReviewerEligibility(userId: string, proposalId: number): Promise<boolean> {
  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: {
      fundingRound: {
        include: {
          topic: {
            include: {
              reviewerGroups: {
                include: {
                  reviewerGroup: {
                    include: {
                      members: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!proposal?.fundingRound?.topic) return false;

  // Check if user or their linked account is in any of the topic's reviewer groups
  return proposal.fundingRound.topic.reviewerGroups.some(trg =>
    trg.reviewerGroup.members.some(member => 
      member.userId === userId
    )
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const proposalId = parseInt((await params).proposalId);
    
    // Check reviewer eligibility
    const isEligible = await checkReviewerEligibility(user.id, proposalId);
    if (!isEligible) {
      return NextResponse.json(
        { error: "Not authorized to vote on this proposal" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = voteSchema.parse(body);

    // Get proposal status
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    if (proposal.status !== 'CONSIDERATION') {
      return NextResponse.json(
        { error: "Proposal is not in consideration phase" },
        { status: 400 }
      );
    }

    // Check if vote already exists
    const existingVote = await prisma.considerationVote.findUnique({
      where: {
        proposalId_voterId: {
          proposalId,
          voterId: user.id
        }
      }
    });

    // Update or create vote
    const vote = existingVote 
      ? await prisma.considerationVote.update({
          where: {
            proposalId_voterId: {
              proposalId,
              voterId: user.id
            }
          },
          data: {
            decision: validatedData.decision,
            feedback: validatedData.feedback,
          },
          include: {
            proposal: true,
            voter: {
              select: {
                metadata: true
              }
            }
          }
        })
      : await prisma.considerationVote.create({
          data: {
            proposalId,
            voterId: user.id,
            decision: validatedData.decision,
            feedback: validatedData.feedback,
          },
          include: {
            proposal: true,
            voter: {
              select: {
                metadata: true
              }
            }
          }
        });

    return NextResponse.json(vote);
  } catch (error) {
    logger.error("Failed to submit vote:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 