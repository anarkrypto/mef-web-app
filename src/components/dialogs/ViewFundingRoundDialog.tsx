'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
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
  fundingRound: FundingRound;
  onWithdraw: () => Promise<void>;
}

export function ViewFundingRoundDialog({ 
  open, 
  onOpenChange, 
  fundingRound,
  onWithdraw 
}: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      await onWithdraw();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw proposal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmWithdraw(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Funding Round Details</DialogTitle>
            <DialogDescription>
              Your proposal is submitted to this funding round
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <h3 className="font-medium">{fundingRound.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{fundingRound.description}</p>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Status: </span>
                <Badge variant="outline">{fundingRound.status}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium">Period: </span>
                <span className="text-sm">
                  {format(new Date(fundingRound.startDate), "PPP")} - {format(new Date(fundingRound.endDate), "PPP")}
                </span>
              </div>
              <div className="space-y-1">
                <div>
                  <span className="text-sm font-medium">Consideration Phase: </span>
                  <span className="text-sm">
                    {format(new Date(fundingRound.considerationPhase.startDate), "PPP")} - {format(new Date(fundingRound.considerationPhase.endDate), "PPP")}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Deliberation Phase: </span>
                  <span className="text-sm">
                    {format(new Date(fundingRound.deliberationPhase.startDate), "PPP")} - {format(new Date(fundingRound.deliberationPhase.endDate), "PPP")}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">Voting Phase: </span>
                  <span className="text-sm">
                    {format(new Date(fundingRound.votingPhase.startDate), "PPP")} - {format(new Date(fundingRound.votingPhase.endDate), "PPP")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setConfirmWithdraw(true)} 
              disabled={loading}
            >
              Withdraw Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmWithdraw} onOpenChange={setConfirmWithdraw}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will withdraw your proposal from the funding round. You can submit it to another funding round later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWithdraw}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Withdrawing..." : "Withdraw Proposal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 