import { PrismaClient, type UserFeedback, Prisma } from "@prisma/client";
import logger from "@/logging";

interface UserMetadata {
  username: string;
  authSource: {
    type: string;
    id: string;
    username: string;
  };
}

function isUserMetadata(value: unknown): value is UserMetadata {
  if (!value || typeof value !== 'object') return false;
  const metadata = value as Record<string, unknown>;
  
  if (typeof metadata.username !== 'string') return false;
  if (!metadata.authSource || typeof metadata.authSource !== 'object') return false;
  
  const authSource = metadata.authSource as Record<string, unknown>;
  return (
    typeof authSource.type === 'string' &&
    typeof authSource.id === 'string' &&
    typeof authSource.username === 'string'
  );
}

interface FeedbackListParams {
  page?: number;
  limit?: number;
  orderBy?: "asc" | "desc";
}

interface PaginatedFeedback {
  items: (UserFeedback & {
    user: {
      id: string;
      metadata: UserMetadata;
    };
  })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class AdminFeedbackService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getFeedbackList({
    page = 1,
    limit = 10,
    orderBy = "desc",
  }: FeedbackListParams): Promise<PaginatedFeedback> {
    try {
      const skip = (page - 1) * limit;

      const [total, items] = await Promise.all([
        this.prisma.userFeedback.count(),
        this.prisma.userFeedback.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: orderBy,
          },
          include: {
            user: {
              select: {
                id: true,
                metadata: true,
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const typedItems = items.map(item => {
        if (!isUserMetadata(item.user.metadata)) {
          logger.error(`Invalid user metadata format for user ${item.user.id}`);
          throw new Error(`Invalid user metadata format for user ${item.user.id}`);
        }
        return {
          ...item,
          user: {
            id: item.user.id,
            metadata: item.user.metadata,
          },
        };
      });

      return {
        items: typedItems,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      logger.error("Error in getFeedbackList:", error);
      throw error;
    }
  }

  async getFeedbackById(id: string): Promise<(UserFeedback & {
    user: {
      id: string;
      metadata: UserMetadata;
    };
  }) | null> {
    try {
      const feedback = await this.prisma.userFeedback.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              metadata: true,
            },
          },
        },
      });

      if (!feedback) return null;

      if (!isUserMetadata(feedback.user.metadata)) {
        logger.error(`Invalid user metadata format for user ${feedback.user.id}`);
        throw new Error(`Invalid user metadata format for user ${feedback.user.id}`);
      }

      return {
        ...feedback,
        user: {
          id: feedback.user.id,
          metadata: feedback.user.metadata,
        },
      };
    } catch (error) {
      logger.error("Error in getFeedbackById:", error);
      throw error;
    }
  }
} 