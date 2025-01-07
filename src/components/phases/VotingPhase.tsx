'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/hooks/use-toast'
import RankedVoteList from '@/components/voting-phase/RankedVoteList'
import { RankedVoteTransactionDialog } from '@/components/web3/dialogs/RankedVoteTransactionDialog'
import { WalletConnectorDialog } from '@/components/web3/WalletConnectorDialog'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GetRankedEligibleProposalsAPIResponse } from '@/services/RankedVotingService'

interface VotingPhaseProps {
  fundingRoundId: string;
  fundingRoundName: string;
}


interface SelectedProposalId {
 id: number 
}

export function VotingPhase({ fundingRoundId, fundingRoundName }: VotingPhaseProps) {
  const { state } = useWallet();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<GetRankedEligibleProposalsAPIResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<SelectedProposalId[]>();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await fetch(`/api/voting/ranked?fundingRoundId=${fundingRoundId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch proposals');
        }
        const data: GetRankedEligibleProposalsAPIResponse = await response.json();
        setProposals(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load proposals",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposals();
  }, [fundingRoundId, toast]);

  const handleSubmit = (selectedProposals: GetRankedEligibleProposalsAPIResponse) => {
    const proposalIds: SelectedProposalId[] = selectedProposals?.proposals.map(p => ({ id: p.id })) ?? [];
    
    setSelectedProposals(proposalIds);
    setShowTransactionDialog(true);
  };

  const handleSaveToMemo = (selectedProposals: GetRankedEligibleProposalsAPIResponse) => {
    const memo = `YES ${selectedProposals.proposals.map(p => p.id).join(' ')}`;
    navigator.clipboard.writeText(memo).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "The vote memo has been copied to your clipboard",
      });
    });
  };

  const handleConnectWallet = () => {
    if (!state.wallet) {
      setShowWalletDialog(true);
    } else {
      setShowTransactionDialog(true);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle>Loading Proposals...</CardTitle>
            <CardDescription>
              Please wait while we fetch the available proposals.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <RankedVoteList
        proposals={proposals}
        onSubmit={handleSubmit}
        onSaveToMemo={handleSaveToMemo}
        onConnectWallet={handleConnectWallet}
        title={`Rank your vote - ${fundingRoundName}`}
        fundingRoundMEFId={1}
      />

      <WalletConnectorDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
      />

      <RankedVoteTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        selectedProposals={selectedProposals??[]}
        fundingRoundId={parseInt(fundingRoundId)}
      />
    </>
  );
} 
