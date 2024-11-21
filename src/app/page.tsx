'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useFeedback } from "@/contexts/FeedbackContext";
import CreateProposal from "@/pages/CreateProposal";
import StartHereComponent from "@/pages/StartHere";

export default function HomePage() {
  const searchParams = useSearchParams();
  const feedback = useFeedback();
  
  useEffect(() => {
    // Check for error param on mount and after navigation
    const error = searchParams?.get('error');
    if (error === 'unauthorized_admin') {
      feedback.error(
        "You don't have permission to access the admin area",
        {
          duration: 5000, // Show for 5 seconds
        }
      );

      // Clean up URL after showing toast
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url);
    }
  }, [searchParams, feedback]);

  return (
    <StartHereComponent />
  );
}
