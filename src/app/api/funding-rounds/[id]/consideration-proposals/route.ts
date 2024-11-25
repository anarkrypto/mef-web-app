import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import type { UserMetadata } from '@/types/consideration';

interface RawUserMetadata {
  username: string;
  createdAt: string;
  authSource: {
    type: string;
    id: string;
    username: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fundingRoundId = (await params).id;

    // Get the funding round with topic and reviewer groups
    const fundingRound = await prisma.fundingRound.findUnique({
      where: { id: fundingRoundId },
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
    });

    if (!fundingRound) {
      return NextResponse.json({ error: "Funding round not found" }, { status: 404 });
    }

    // Check if user is a reviewer
    const isReviewer = fundingRound.topic.reviewerGroups.some(trg => 
      trg.reviewerGroup.members.some(m => 
        m.userId === user.id || m.userId === user.linkId
      )
    );

    const proposals = await prisma.proposal.findMany({
      where: {
        fundingRoundId,
        status: 'CONSIDERATION',
      },
      include: {
        user: {
          select: {
            metadata: true
          }
        },
        considerationVotes: {
          where: {
            voterId: user.id
          },
          select: {
            decision: true,
            feedback: true
          }
        },
        _count: {
          select: {
            considerationVotes: true
          }
        }
      }
    });

    // Get vote counts for each proposal
    const proposalVoteCounts = await Promise.all(
      proposals.map(async (proposal) => {
        const voteCounts = await prisma.considerationVote.groupBy({
          by: ['decision'],
          where: {
            proposalId: proposal.id
          },
          _count: true
        });

        const approved = voteCounts.find(v => v.decision === 'APPROVED')?._count || 0;
        const rejected = voteCounts.find(v => v.decision === 'REJECTED')?._count || 0;

        return {
          proposalId: proposal.id,
          voteStats: {
            approved,
            rejected,
            total: approved + rejected
          }
        };
      })
    );

    // Transform the data to match the expected format
    const formattedProposals = proposals.map(p => {
      const voteCounts = proposalVoteCounts.find(vc => vc.proposalId === p.id)?.voteStats;
      
      return {
        id: p.id,
        proposalName: p.proposalName,
        submitter: ((p.user.metadata as unknown) as RawUserMetadata).username,
        abstract: p.abstract,
        status: p.considerationVotes[0]?.decision?.toLowerCase() || 'pending',
        userVote: p.considerationVotes[0] ? {
          decision: p.considerationVotes[0].decision,
          feedback: p.considerationVotes[0].feedback
        } : undefined,
        createdAt: p.createdAt,
        isReviewerEligible: isReviewer,
        voteStats: voteCounts || { approved: 0, rejected: 0, total: 0 }
      };
    });

    // Sort proposals: pending first, then voted
    const sortedProposals = formattedProposals.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });

    return NextResponse.json(sortedProposals);
  } catch (error) {
    console.error("Failed to fetch consideration proposals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 