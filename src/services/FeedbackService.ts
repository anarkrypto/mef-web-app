import { PrismaClient, UserFeedback, Prisma } from "@prisma/client";
import logger from "@/logging";

interface FeedbackInput {
  userId: string;
  feedback: string;
  image?: Buffer;
  metadata: {
    url: string;
    userAgent: string;
    timestamp: string;
  };
}

export class FeedbackService {
  constructor(private prisma: PrismaClient) {}

  async submitFeedback(input: FeedbackInput): Promise<UserFeedback> {
    try {
      const feedback = await this.prisma.userFeedback.create({
        data: {
          userId: input.userId,
          feedback: input.feedback,
          image: input.image,
          metadata: input.metadata,
        },
      });

      logger.info(`Feedback submitted for user ${input.userId}`);
      return feedback;
    } catch (error) {
      logger.error("Error submitting feedback:", error);
      throw error;
    }
  }

  async getFeedbackByUserId(userId: string): Promise<UserFeedback[]> {
    return this.prisma.userFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
} 