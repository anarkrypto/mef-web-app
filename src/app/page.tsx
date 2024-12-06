'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFeedback } from "@/contexts/FeedbackContext";
import { useAuth } from "@/contexts/AuthContext";
import { FundingRoundStatus } from "@/components/FundingRoundStatus";
import { ConsiderationProposalList } from '@/components/ConsiderationProposalList';
import { SubmissionProposalList } from '@/components/phases/SubmissionProposalList';
import { DeliberationPhase } from '@/components/phases/DeliberationPhase';
import { VotingPhase } from '@/components/phases/VotingPhase';
import { CompletedPhase } from '@/components/phases/CompletedPhase';
import { BetweenPhases } from '@/components/phases/BetweenPhases';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Phase = 'submission' | 'consider' | 'deliberate' | 'vote' | 'completed';

type SelectedRound = {
  id: string;
  name: string;
  phase: Phase | null;
  submissionPhase: { startDate: string; endDate: string };
  considerationPhase: { startDate: string; endDate: string };
  deliberationPhase: { startDate: string; endDate: string };
  votingPhase: { startDate: string; endDate: string };
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const feedback = useFeedback();
  const { user, isLoading } = useAuth();
  const [selectedRound, setSelectedRound] = useState<SelectedRound | null>(null);
  
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

    // If we're between phases, render the BetweenPhases component
    if (selectedRound.phase === null) {
      // Calculate next phase details from the funding round data
      const phases = [
        { name: 'Submission', startDate: new Date(selectedRound.submissionPhase.startDate) },
        { name: 'Consideration', startDate: new Date(selectedRound.considerationPhase.startDate) },
        { name: 'Deliberation', startDate: new Date(selectedRound.deliberationPhase.startDate) },
        { name: 'Voting', startDate: new Date(selectedRound.votingPhase.startDate) }
      ];

      const now = new Date();
      const nextPhase = phases.find(p => p.startDate > now);

      if (nextPhase) {
        // Find the previous phase for context
        const phaseIndex = phases.indexOf(nextPhase);
        const previousPhaseName = phaseIndex > 0 ? phases[phaseIndex - 1].name : null;

        return (
          <BetweenPhases
            currentPhase={previousPhaseName}
            nextPhaseStart={nextPhase.startDate}
            nextPhaseName={nextPhase.name}
          />
        );
      }
    }

    // Regular phase rendering
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

  // Don't render funding round components if user isn't authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Mina Ecosystem Funding</CardTitle>
            <CardDescription>
              Please sign in to view active funding rounds and participate in the ecosystem.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <FundingRoundStatus onRoundSelect={setSelectedRound} />
      {renderPhaseComponent()}
    </>
  );
}
