'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFeedback } from "@/contexts/FeedbackContext";
import { FundingRoundStatus } from "@/components/FundingRoundStatus";
import { ConsiderationProposalList } from '@/components/ConsiderationProposalList';
import { SubmissionProposalList } from '@/components/phases/SubmissionProposalList';
import { DeliberationPhase } from '@/components/phases/DeliberationPhase';
import { VotingPhase } from '@/components/phases/VotingPhase';
import { CompletedPhase } from '@/components/phases/CompletedPhase';

type Phase = 'submission' | 'consider' | 'deliberate' | 'vote' | 'completed';

export default function HomePage() {
  const searchParams = useSearchParams();
  const feedback = useFeedback();
  const [selectedRound, setSelectedRound] = useState<{ id: string; name: string; phase: Phase } | null>(null);
  
  useEffect(() => {
    // Check for error param on mount and after navigation
    const error = searchParams?.get('error');
    if (error === 'unauthorized_admin') {
      feedback.error(
        "You don't have permission to access the admin area",
        {
          duration: 5000, // Show for 5 seconds
        }
      );

      // Clean up URL after showing toast
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, feedback]);

  const renderPhaseComponent = () => {
    if (!selectedRound) return null;

    switch (selectedRound.phase) {
      case 'submission':
        return (
          <SubmissionProposalList
            fundingRoundId={selectedRound.id}
            fundingRoundName={selectedRound.name}
          />
        );
      case 'consider':
        return (
          <ConsiderationProposalList
            fundingRoundId={selectedRound.id}
            fundingRoundName={selectedRound.name}
          />
        );
      case 'deliberate':
        return <DeliberationPhase />;
      case 'vote':
        return <VotingPhase />;
      case 'completed':
        return <CompletedPhase />;
      default:
        return null;
    }
  };

  return (
    <>
      <FundingRoundStatus onRoundSelect={setSelectedRound} />
      {renderPhaseComponent()}
    </>
  );
}
