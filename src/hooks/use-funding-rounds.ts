'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from "@/hooks/use-toast"

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE';
  submissionPhase: {
    startDate: string;
    endDate: string;
  };
  considerationPhase: {
    startDate: string;
    endDate: string;
  };
}

export function useFundingRounds() {
  const [loading, setLoading] = useState(true);
  const [availableRounds, setAvailableRounds] = useState<FundingRound[]>([]);
  const { toast } = useToast();

  const fetchAvailableRounds = useCallback(async () => {
    try {
      setLoading(true);
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

      setAvailableRounds(activeRounds);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check available funding rounds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAvailableRounds();
  }, [fetchAvailableRounds]);

  return {
    loading,
    hasAvailableRounds: availableRounds.length > 0,
    refresh: fetchAvailableRounds
  };
} 