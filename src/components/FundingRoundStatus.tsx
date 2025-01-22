'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format, differenceInDays } from 'date-fns'
import { Proposal } from '@prisma/client'

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
  totalBudget: string;
  proposals: Proposal[];
  mefId: number;
  submissionPhase: {
    startDate: string;
    endDate: string;
  };
  considerationPhase: {
    startDate: string;
    endDate: string;
  };
  deliberationPhase: {
    startDate: string;
    endDate: string;
  };
  votingPhase: {
    startDate: string;
    endDate: string;
  };
}

type PhaseKey = 'submissionPhase' | 'considerationPhase' | 'deliberationPhase' | 'votingPhase';
type PhaseType = 'submission' | 'consider' | 'deliberate' | 'vote';

// Create a mapping between phase types and their corresponding phase keys
const PHASE_MAPPING: Record<PhaseType, PhaseKey> = {
  'submission': 'submissionPhase',
  'consider': 'considerationPhase',
  'deliberate': 'deliberationPhase',
  'vote': 'votingPhase'
} as const;

interface Props {
  onRoundSelect?: (round: { 
    id: string; 
    name: string; 
    phase: PhaseType | null;
    mefId: number,
    submissionPhase: { startDate: string; endDate: string };
    considerationPhase: { startDate: string; endDate: string };
    deliberationPhase: { startDate: string; endDate: string };
    votingPhase: { startDate: string; endDate: string };
  }) => void;
}

export function FundingRoundStatus({ onRoundSelect }: Props) {
  const getCurrentPhase = (round: FundingRound): PhaseType | null => {
    const now = new Date();
    
    // Check each phase in chronological order
    if (now >= new Date(round.submissionPhase.startDate) && 
        now <= new Date(round.submissionPhase.endDate)) {
      return 'submission';
    }
    if (now >= new Date(round.considerationPhase.startDate) && 
        now <= new Date(round.considerationPhase.endDate)) {
      return 'consider';
    }
    if (now >= new Date(round.deliberationPhase.startDate) && 
        now <= new Date(round.deliberationPhase.endDate)) {
      return 'deliberate';
    }
    if (now >= new Date(round.votingPhase.startDate) && 
        now <= new Date(round.votingPhase.endDate)) {
      return 'vote';
    }

    // If we're not in any active phase, determine if we're between phases
    const phases = [
      { phase: 'submission', dates: round.submissionPhase },
      { phase: 'consider', dates: round.considerationPhase },
      { phase: 'deliberate', dates: round.deliberationPhase },
      { phase: 'vote', dates: round.votingPhase }
    ];

    // Find the next phase
    const nextPhase = phases.find(p => now < new Date(p.dates.startDate));
    
    // If there's no next phase and we're past all phases, return the last phase
    if (!nextPhase && now > new Date(round.votingPhase.endDate)) {
      return 'vote';
    }

    // Return null to indicate we're between phases
    return null;
  };

  const getTimeRemainingWithEmoji = (date: Date): { text: string; emoji: string } => {
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
  };

  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedRound = selectedRoundId 
    ? fundingRounds.find(round => round.id === selectedRoundId)
    : null;

  const currentPhase = selectedRound ? getCurrentPhase(selectedRound) : 'submission' as PhaseType;

  useEffect(() => {
    const fetchFundingRounds = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/funding-rounds');
        
        // If unauthorized, silently fail - parent component should handle auth state
        if (response.status === 401) {
          setFundingRounds([]);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch funding rounds');
        }

        const data = await response.json();
        const rounds = Array.isArray(data) ? data : [];
        setFundingRounds(rounds);
        
        const activeRound = rounds.find((round: FundingRound) => round.status === 'ACTIVE');
        if (activeRound) {
          setSelectedRoundId(activeRound.id);
        }
      } catch (error) {
        console.error('Failed to fetch funding rounds:', error);
        setFundingRounds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFundingRounds();
  }, []);

  useEffect(() => {
    if (selectedRound && onRoundSelect) {
      onRoundSelect({
        id: selectedRound.id,
        name: selectedRound.name,
        phase: currentPhase,
        mefId: selectedRound.mefId,
        submissionPhase: selectedRound.submissionPhase,
        considerationPhase: selectedRound.considerationPhase,
        deliberationPhase: selectedRound.deliberationPhase,
        votingPhase: selectedRound.votingPhase
      });
    }
  }, [selectedRound, onRoundSelect, currentPhase]);

  const isUpcoming = (round: FundingRound) => {
    return new Date(round.startDate) > new Date();
  };

  if (loading) {
    return <div className="flex items-center justify-center p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (fundingRounds.length === 0 && !loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>No Active Funding Rounds</CardTitle>
            <CardDescription>
              There are currently no active funding rounds available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const phases: PhaseType[] = ['submission', 'consider', 'deliberate', 'vote'];

  const renderPhaseTimeline = () => {
    if (!selectedRound) return null;

    return phases.map((phase, index) => {
      const isActive = phase === currentPhase;
      const phaseKey = PHASE_MAPPING[phase];
      
      // Now we can safely access the phase dates
      const isCompleted = currentPhase === null 
        ? new Date() > new Date(selectedRound[phaseKey].endDate)
        : phases.indexOf(phase) < phases.indexOf(currentPhase);
      
      return (
        <div key={phase} className="relative">
          {/* Timeline connector */}
          {index > 0 && (
            <div 
              className={cn(
                "absolute -top-4 left-4 w-0.5 h-4",
                isCompleted ? "bg-primary" : "bg-muted-foreground/20"
              )} 
            />
          )}
          
          <div
            className={cn(
              "p-3 rounded-md font-medium capitalize relative",
              isCompleted && "text-primary bg-primary/10",
              isActive && "bg-primary text-primary-foreground",
              !isActive && !isCompleted && "text-muted-foreground"
            )}
          >
            {/* Phase icon */}
            <span className="mr-2">
              {phase === 'submission' && "📝"}
              {phase === 'consider' && "🤔"}
              {phase === 'deliberate' && "💭"}
              {phase === 'vote' && "🗳️"}
            </span>
            
            {/* Phase name */}
            {phase}
            
            {/* Completion indicator */}
            {isCompleted && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                ✓
              </span>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-8">
        {/* Funding Round Selector */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          {fundingRounds.map((round) => (
            <TooltipProvider key={round.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant={round.id === selectedRoundId ? "default" : "outline"}
                      onClick={() => !isUpcoming(round) && setSelectedRoundId(round.id)}
                      className={cn(
                        "min-w-[120px]",
                        isUpcoming(round) && "opacity-50 cursor-not-allowed",
                        round.status === 'COMPLETED' && "border-muted-foreground"
                      )}
                    >
                      {round.status === 'COMPLETED' && "🏁 "}
                      {round.status === 'ACTIVE' && "🟢 "}
                      {isUpcoming(round) && "⏳ "}
                      {round.name}
                    </Button>
                  </div>
                </TooltipTrigger>
                {isUpcoming(round) && (
                  <TooltipContent>
                    <p>Starts on {format(new Date(round.startDate), "PPP")}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {selectedRound && (
          <>
            {/* Status Overview */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">📊 Funding Round Status</h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-4xl font-bold">📝 {selectedRound.proposals?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Proposals Submitted</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">💰 {selectedRound.totalBudget}</div>
                    <div className="text-sm text-muted-foreground">Total $MINA Funding</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">
                      {getTimeRemainingWithEmoji(new Date(selectedRound.endDate)).emoji}{" "}
                      {getTimeRemainingWithEmoji(new Date(selectedRound.endDate)).text}
                    </div>
                    <div className="text-sm text-muted-foreground">Until End</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">
                      {getTimeRemainingWithEmoji(
                        new Date(
                          currentPhase === 'consider' ? selectedRound.considerationPhase.endDate :
                          currentPhase === 'deliberate' ? selectedRound.deliberationPhase.endDate :
                          selectedRound.votingPhase.endDate
                        )
                      ).emoji}{" "}
                      {getTimeRemainingWithEmoji(
                        new Date(
                          currentPhase === 'consider' ? selectedRound.considerationPhase.endDate :
                          currentPhase === 'deliberate' ? selectedRound.deliberationPhase.endDate :
                          selectedRound.votingPhase.endDate
                        )
                      ).text}
                    </div>
                    <div className="text-sm text-muted-foreground">In {currentPhase} Phase</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-[200px,1fr] gap-8">
              {/* Phase Progress */}
              <div className="space-y-4">
                {renderPhaseTimeline()}
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                {currentPhase === 'submission' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>📝 Submission Phase</CardTitle>
                      <CardDescription>Submit your proposals for this funding round. Review other submissions and provide feedback.</CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {currentPhase === 'consider' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🤔 Consideration Phase</CardTitle>
                      <CardDescription>Review submitted proposals and determine which ones you find valuable enough to receive funding.</CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {currentPhase === 'deliberate' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>💭 Deliberation Phase</CardTitle>
                      <CardDescription>Discuss and refine proposals with the community before final voting.</CardDescription>
                    </CardHeader>
                  </Card>
                )}

                {currentPhase === 'vote' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🗳️ Voting Phase</CardTitle>
                      <CardDescription>Cast your votes to determine which proposals will receive funding.</CardDescription>
                    </CardHeader>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}

        {/* Help Link */}
        <div className="text-right">
          <Link 
            href="/start-here" 
            className="text-primary hover:underline"
          >
            ❓ Feeling lost? Check Start Here Section
          </Link>
        </div>
      </div>
    </div>
  );

}