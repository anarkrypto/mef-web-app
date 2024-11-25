'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/hooks/use-toast"

interface ConsiderationProposal {
  id: number;
  proposalName: string;
  submitter: string;
  abstract: string;
  status: 'pending' | 'approved' | 'rejected';
  decision?: string;
}

export function useConsiderationPhase(fundingRoundId: string) {
  const [proposals, setProposals] = useState<ConsiderationProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/funding-rounds/${fundingRoundId}/consideration-proposals`);
        if (!response.ok) throw new Error('Failed to fetch proposals');
        const data = await response.json();
        setProposals(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load proposals",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (fundingRoundId) {
      fetchProposals();
    }
  }, [fundingRoundId, toast]);

  return {
    proposals,
    loading,
    setProposals
  };
} 