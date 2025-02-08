import { type FC } from 'react';
import { notFound } from 'next/navigation';
import { VotingService } from '@/services/VotingService';
import { prisma } from '@/lib/prisma';
import { VotingPhaseSummary } from '@/components/phase-summary/VotingPhaseSummary';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const VotingPhaseSummaryPage = async ({ params }: Props) => {
  const { id } = await params;
  const votingService = new VotingService(prisma);
  
  try {
    const summary = await votingService.getVotingPhaseSummary(id);
    console.log(summary);
    
    return (
      <div className="container max-w-7xl mx-auto py-6">
        <VotingPhaseSummary
          summary={summary}
          fundingRoundId={id}
        />
      </div>
    );
  } catch (error) {
    return notFound();
  }
};

export default VotingPhaseSummaryPage; 