'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFeedback } from "@/contexts/FeedbackContext";
import { FundingRoundStatus } from "@/components/FundingRoundStatus";
import { ConsiderationProposalList } from '@/components/ConsiderationProposalList';

export default function HomePage() {
  const searchParams = useSearchParams();
  const feedback = useFeedback();
  const [selectedRound, setSelectedRound] = useState<{ id: string; name: string } | null>(null);
  
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

  // Only render ConsiderationProposalList if we have a selected round
  return (
    <>
      <FundingRoundStatus onRoundSelect={setSelectedRound} />
      {selectedRound && (
        <ConsiderationProposalList
          fundingRoundId={selectedRound.id}
          fundingRoundName={selectedRound.name}
        />
      )}
    </>
  );
}
