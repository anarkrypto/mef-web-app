'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SubmitProposalConfirmDialog } from "./SubmitProposalConfirmDialog"

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE';
  startDate: string;
  endDate: string;
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalTitle: string;
  onSubmit: (roundId: string) => Promise<void>;
}

function getTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = Math.abs(end.getTime() - now.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h remaining`;
  }
  return `${diffHours}h remaining`;
}

export function SelectFundingRoundDialog({ 
  open, 
  onOpenChange, 
  proposalTitle, 
  onSubmit 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/funding-rounds/active');
        if (!response.ok) throw new Error('Failed to fetch funding rounds');
        const data = await response.json();
        
        // Filter rounds that are in submission phase
        const now = new Date();
        const activeRounds = data.filter((round: FundingRound) => {
          const startDate = new Date(round.submissionPhase.startDate);
          const endDate = new Date(round.submissionPhase.endDate);
          return startDate <= now && now <= endDate;
        });

        setRounds(activeRounds);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load funding rounds",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchRounds();
    }
  }, [open, toast]);

  const handleSubmit = () => {
    if (!selectedRoundId) {
      toast({
        title: "Error",
        description: "Please select a funding round",
        variant: "destructive",
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onSubmit(selectedRoundId);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit proposal to funding round",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedRound = rounds.find(round => round.id === selectedRoundId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit to Funding Round</DialogTitle>
            <DialogDescription>
              Select a funding round to submit your proposal to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : rounds.length > 0 ? (
              <Select
                value={selectedRoundId}
                onValueChange={setSelectedRoundId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a funding round" />
                </SelectTrigger>
                <SelectContent>
                  {rounds.map((round) => (
                    <SelectItem key={round.id} value={round.id}>
                      <div className="flex flex-col">
                        <span>📋 {round.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ⏳ {getTimeRemaining(round.submissionPhase.endDate)} to submit
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  There are currently no active funding rounds accepting submissions. Please check back later or contact the team for more information.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {rounds.length === 0 ? "Close" : "Cancel"}
            </Button>
            {rounds.length > 0 && (
              <Button onClick={handleSubmit} disabled={loading || !selectedRoundId}>
                Continue
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedRound && (
        <SubmitProposalConfirmDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          proposalTitle={proposalTitle}
          fundingRound={selectedRound}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
} 