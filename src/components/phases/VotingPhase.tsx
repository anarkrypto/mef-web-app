'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/hooks/use-toast'
import RankedVoteList from '@/components/voting-phase/RankedVoteList'
import { RankedVoteTransactionDialog } from '@/components/web3/dialogs/RankedVoteTransactionDialog'
import { WalletConnectorDialog } from '@/components/web3/WalletConnectorDialog'
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GetRankedEligibleProposalsAPIResponse } from '@/services/RankedVotingService'
import type { OCVRankedVoteResponse } from '@/services/OCVApiService'
import { LocalStorageCache } from '@/lib/local-storage-cache'

const VOTE_DATA_CACHE_PREFIX = 'ocv_vote_data';

interface VotingPhaseProps {
  fundingRoundId: string;
  fundingRoundName: string;
}

interface SelectedProposalId {
  id: number 
}

export function VotingPhase({ 
  fundingRoundId, 
  fundingRoundName,
}: VotingPhaseProps) {
  const { state } = useWallet();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<GetRankedEligibleProposalsAPIResponse>();
  const [voteData, setVoteData] = useState<OCVRankedVoteResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedProposals, setSelectedProposals] = useState<SelectedProposalId[]>();

  // Fetch proposals
  useEffect(() => {
    let ignore = false;

    const fetchProposals = async () => {
      try {
        const response = await fetch(`/api/voting/ranked?fundingRoundId=${fundingRoundId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch proposals');
        }
        const data: GetRankedEligibleProposalsAPIResponse = await response.json();
        
        if (!ignore) {
          setProposals(data);
          // Reset vote data when switching funding rounds
          setVoteData(undefined);
          setSelectedProposals(undefined);
        }
      } catch (error) {
        if (!ignore) {
          toast({
            title: "Error",
            description: "Failed to load proposals",
            variant: "destructive",
          });
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    fetchProposals();

    return () => {
      ignore = true;
    };
  }, [fundingRoundId, toast]);

  // Fetch vote data when wallet is connected
  useEffect(() => {
    let ignore = false;

    const fetchAndUpdateVoteData = async () => {
      if (!state.wallet?.address || !proposals?.fundingRound.mefId || !proposals.fundingRound.votingPhase) return;

      try {
        const startTimeDate = new Date(proposals.fundingRound.votingPhase.startDate);
        const endTimeDate = new Date(proposals.fundingRound.votingPhase.endDate);

        const startTime = startTimeDate.getTime();
        const endTime = endTimeDate.getTime();

        // Try to get cached data first
        const cacheKey = LocalStorageCache.getKey(VOTE_DATA_CACHE_PREFIX, proposals.fundingRound.mefId);
        const cachedData = LocalStorageCache.get<OCVRankedVoteResponse>(cacheKey);

        // If we have cached data, use it immediately
        if (cachedData && !ignore) {
          setVoteData(cachedData);
          updateSelectedProposals(cachedData, proposals);
        }

        // Always fetch fresh data
        const response = await fetch(
          `/api/voting/ranked-votes?roundId=${proposals.fundingRound.mefId}&startTime=${startTime}&endTime=${endTime}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch vote data');
        }

        const data  = await response.json();
        
        // Only update state if this effect is still valid
        if (!ignore) {
          setVoteData(data);
          // Cache the fresh data
          LocalStorageCache.set(cacheKey, data);
          updateSelectedProposals(data, proposals);
        }
      } catch (error) {
        if (!ignore) {
          toast({
            title: "Warning",
            description: "Failed to load vote data. You may still submit a new vote.",
            variant: "default",
          });
        }
      }
    };

    const updateSelectedProposals = (
      voteData: OCVRankedVoteResponse, 
      proposals: GetRankedEligibleProposalsAPIResponse
    ) => {
      const userVote = voteData.votes.find(
        (vote: OCVRankedVoteResponse['votes'][0]) => vote.account.toLowerCase() === state.wallet!.address.toLowerCase()
      );

      if (userVote) {
        const votedProposals = proposals.proposals
          .filter(p => userVote.proposals.includes(p.id))
          .sort((a, b) => {
            const aIndex = userVote.proposals.indexOf(a.id);
            const bIndex = userVote.proposals.indexOf(b.id);
            return aIndex - bIndex;
          })
          .map(p => ({ id: p.id }));

        setSelectedProposals(votedProposals);
      }
    };

    fetchAndUpdateVoteData();

    return () => {
      ignore = true;
    };
  }, [state.wallet?.address, proposals?.fundingRound.mefId, proposals?.fundingRound.votingPhase, toast, proposals, state.wallet]);

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
        existingVote={voteData?.votes.find(
          vote => vote.account.toLowerCase() === state.wallet?.address?.toLowerCase()
        )}
        onSubmit={handleSubmit}
        onSaveToMemo={handleSaveToMemo}
        onConnectWallet={handleConnectWallet}
        title={`Rank your vote - ${fundingRoundName}`}
        fundingRoundMEFId={proposals?.fundingRound.mefId || 0}
      />

      <WalletConnectorDialog
        open={showWalletDialog}
        onOpenChange={setShowWalletDialog}
      />

      <RankedVoteTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        selectedProposals={selectedProposals??[]}
        fundingRoundMEFId={parseInt(fundingRoundId)}
      />
    </>
  );
} 
