import { PrismaClient, FundingRound as PrismaFundingRound, FundingRoundStatus } from "@prisma/client";

interface FundingRoundWithPhases extends PrismaFundingRound {
  considerationPhase: {
    startDate: Date;
    endDate: Date;
  };
  deliberationPhase: {
    startDate: Date;
    endDate: Date;
  };
  votingPhase: {
    startDate: Date;
    endDate: Date;
  };
}

export class FundingRoundService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllFundingRounds() {
    return await this.prisma.fundingRound.findMany({
      include: {
        proposals: true,
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getActiveFundingRounds() {
    const now = new Date();
    return await this.prisma.fundingRound.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        status: 'ACTIVE',
      },
      include: {
        proposals: true,
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async getFundingRoundById(id: string) {
    return await this.prisma.fundingRound.findUnique({
      where: { id },
      include: {
        proposals: true,
        considerationPhase: true,
        deliberationPhase: true,
        votingPhase: true,
      },
    });
  }

  getCurrentPhase(fundingRound: FundingRoundWithPhases) {
    const now = new Date();

    if (now < new Date(fundingRound.startDate)) {
      return 'upcoming';
    }

    if (now >= new Date(fundingRound.considerationPhase.startDate) && 
        now <= new Date(fundingRound.considerationPhase.endDate)) {
      return 'consideration';
    }

    if (now >= new Date(fundingRound.deliberationPhase.startDate) && 
        now <= new Date(fundingRound.deliberationPhase.endDate)) {
      return 'deliberation';
    }

    if (now >= new Date(fundingRound.votingPhase.startDate) && 
        now <= new Date(fundingRound.votingPhase.endDate)) {
      return 'voting';
    }

    if (now > new Date(fundingRound.endDate)) {
      return 'completed';
    }

    return 'unknown';
  }

  getTimeRemaining(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // Convert to positive number for calculations
    const absDiff = Math.abs(diff);
    
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

    // If more than one day remaining
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    
    // If less than one day remaining
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    // If less than one hour remaining
    return `${minutes}m`;
  }

  getTimeRemainingWithEmoji(date: Date): { text: string; emoji: string } {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // For time that has passed
    if (diff < 0) {
      return {
        text: "Ended",
        emoji: "🏁"
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // More than 7 days
    if (days > 7) {
      return {
        text: `${days}d ${hours}h`,
        emoji: "📅"
      };
    }
    
    // 1-7 days
    if (days > 0) {
      return {
        text: `${days}d ${hours}h`,
        emoji: "⏳"
      };
    }
    
    // Less than 24 hours
    if (hours > 0) {
      return {
        text: `${hours}h ${minutes}m`,
        emoji: "⌛"
      };
    }
    
    // Less than 1 hour
    return {
      text: `${minutes}m`,
      emoji: "⚡"
    };
  }
} 