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

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE';
  considerationPhase: {
    startDate: string;
    endDate: string;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (roundId: string) => Promise<void>;
}

export function SelectFundingRoundDialog({ open, onOpenChange, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const response = await fetch('/api/funding-rounds/active');
        if (!response.ok) throw new Error('Failed to fetch funding rounds');
        const data = await response.json();
        
        // Filter rounds that are in consideration phase
        const now = new Date();
        const activeRounds = data.filter((round: FundingRound) => {
          const startDate = new Date(round.considerationPhase.startDate);
          const endDate = new Date(round.considerationPhase.endDate);
          return startDate <= now && now <= endDate;
        });

        // TODO: Later, also filter out DRAFT status rounds
        setRounds(activeRounds);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load funding rounds",
          variant: "destructive",
        });
      }
    };

    if (open) {
      fetchRounds();
    }
  }, [open, toast]);

  const handleSubmit = async () => {
    if (!selectedRoundId) {
      toast({
        title: "Error",
        description: "Please select a funding round",
        variant: "destructive",
      });
      return;
    }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit to Funding Round</DialogTitle>
          <DialogDescription>
            Select a funding round to submit your proposal to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
                    <span>{round.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Consideration phase: {format(new Date(round.considerationPhase.startDate), "PPP")} - {format(new Date(round.considerationPhase.endDate), "PPP")}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedRoundId}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 