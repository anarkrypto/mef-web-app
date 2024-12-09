import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"
import type { ProposalStatus } from '@prisma/client';
import type { Dispatch, SetStateAction } from 'react';

interface SubmissionProposal {
  id: number;
  proposalName: string;
  abstract: string;
  budgetRequest: number;
  submitter: string;
  createdAt: Date;
  status: ProposalStatus;
}

interface UseSubmissionPhaseResult {
  proposals: SubmissionProposal[];
  loading: boolean;
  error: string | null;
  setProposals: Dispatch<SetStateAction<SubmissionProposal[]>>;
}

export function useSubmissionPhase(fundingRoundId: string): UseSubmissionPhaseResult {
  const [proposals, setProposals] = useState<SubmissionProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProposals() {
      try {
        const response = await fetch(
          `/api/funding-rounds/${fundingRoundId}/submitted-proposals`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch proposals');
        }

        const data = await response.json();
        
        const transformedData = data.map((proposal: SubmissionProposal) => ({
          ...proposal,
        }));
        
        setProposals(transformedData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch proposals';
        setError(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [fundingRoundId, toast]);

  return {
    proposals,
    loading,
    error,
    setProposals,
  };
} 