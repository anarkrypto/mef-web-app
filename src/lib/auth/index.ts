import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import type { User } from "@prisma/client";
import prisma from "@/lib/prisma";
import logger from "@/logging";
import { UserService } from "@/services/UserService";

export async function getOrCreateUserFromRequest(req: Request): Promise<User | null> {
  try {
    const userService = new UserService(prisma);

    // Get the access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    
    if (!accessToken) {
      return null;
    }

    // Verify the token and get payload
    const payload = await verifyToken(accessToken);

    // Resolve user from payload
    const user = await userService.findOrCreateUser(payload.authSource);

    return user;
  } catch (error) {
    logger.error("Error getting user from request:", error);
    return null;
  }
}

export async function checkVotingEligibility(
  userId: string,
  proposalId: number
): Promise<{ isEligible: boolean; reason?: string }> {
  try {
    // Get user and their linked accounts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviewerGroupMemberships: {
          include: {
            reviewerGroup: {
              include: {
                topics: {
                  include: {
                    topic: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return { isEligible: false, reason: "User not found" };
    }

    // Get proposal with funding round and topic
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        fundingRound: {
          include: {
            topic: true,
            considerationPhase: true
          }
        }
      }
    });

    if (!proposal) {
      return { isEligible: false, reason: "Proposal not found" };
    }

    // Check if proposal is in consideration phase
    if (proposal.status !== 'CONSIDERATION') {
      return { isEligible: false, reason: "Proposal is not in consideration phase" };
    }

    // Check if user has already voted
    const existingVote = await prisma.considerationVote.findUnique({
      where: {
        proposalId_voterId: {
          proposalId,
          voterId: userId
        }
      }
    });

    if (existingVote) {
      return { isEligible: false, reason: "Already voted" };
    }

    // Check if user is in a reviewer group for the proposal's topic
    const isReviewer = user.reviewerGroupMemberships.some(membership => 
      membership.reviewerGroup.topics.some(t => 
        t.topic.id === proposal.fundingRound?.topicId
      )
    );

    if (!isReviewer) {
      return { isEligible: false, reason: "Not a reviewer for this topic" };
    }

    return { isEligible: true };
  } catch (error) {
    logger.error("Error checking voting eligibility:", error);
    return { isEligible: false, reason: "Error checking eligibility" };
  }
}
