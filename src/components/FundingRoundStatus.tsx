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
import { FundingRoundService } from '@/services/FundingRoundService'

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
  totalBudget: string;
  proposals: Proposal[];
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

type Phase = 'submit' | 'consider' | 'deliberate' | 'vote';

interface Props {
  onRoundSelect?: (round: { id: string; name: string } | null) => void;
}

export function FundingRoundStatus({ onRoundSelect }: Props) {
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFundingRounds = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/funding-rounds');
        if (!response.ok) throw new Error('Failed to fetch funding rounds');
        const data = await response.json();
        
        // Ensure data is an array
        const rounds = Array.isArray(data) ? data : [];
        setFundingRounds(rounds);
        
        // Select first active round by default
        const activeRound = rounds.find((round: FundingRound) => round.status === 'ACTIVE');
        if (activeRound) {
          setSelectedRoundId(activeRound.id);
        }
      } catch (error) {
        console.error('Failed to fetch funding rounds:', error);
        // Set empty array on error to prevent undefined
        setFundingRounds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFundingRounds();
  }, []);

  const selectedRound = selectedRoundId 
    ? fundingRounds.find(round => round.id === selectedRoundId)
    : null;
  
  const getCurrentPhase = (round: FundingRound): Phase => {
    const now = new Date();
    
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
    return 'submit';
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

  const isUpcoming = (round: FundingRound) => {
    return new Date(round.startDate) > new Date();
  };

  useEffect(() => {
    if (selectedRound && onRoundSelect) {
      onRoundSelect({
        id: selectedRound.id,
        name: selectedRound.name
      });
    }
  }, [selectedRound, onRoundSelect]);

  if (loading) {
    return <div className="flex items-center justify-center p-6">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  const currentPhase = selectedRound ? getCurrentPhase(selectedRound) : 'submit' as Phase;
  const phases: Phase[] = ['submit', 'consider', 'deliberate', 'vote'];

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
                {phases.map((phase) => {
                  const isActive = phase === currentPhase;
                  const isCompleted = phases.indexOf(phase) < phases.indexOf(currentPhase);
                  
                  return (
                    <div
                      key={phase}
                      className={cn(
                        "p-3 rounded-md font-medium capitalize",
                        isCompleted && "text-muted-foreground",
                        isActive && "bg-primary text-primary-foreground",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )}
                    >
                      {phase === 'submit' && "📝 "}
                      {phase === 'consider' && "🤔 "}
                      {phase === 'deliberate' && "💭 "}
                      {phase === 'vote' && "🗳️ "}
                      {phase}
                    </div>
                  );
                })}
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                {currentPhase === 'consider' && (
                  <>
                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {/* Handle click */}}
                    >
                      <CardHeader>
                        <CardTitle>📊 Submissions (in progress)</CardTitle>
                        <CardDescription>Proposal submissions are in progress</CardDescription>
                      </CardHeader>
                    </Card>

                    <Card
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => {/* Handle click */}}
                    >
                      <CardHeader>
                        <CardTitle>🤔 Consider (in progress)</CardTitle>
                        <CardDescription>Review the submitted proposals and determine which ones you find valuable enough to receive funding</CardDescription>
                      </CardHeader>
                    </Card>
                  </>
                )}
                
                {/* Add similar sections for other phases */}
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