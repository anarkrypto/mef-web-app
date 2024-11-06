import { useState } from "react";
import { useFeedback } from "@/contexts/FeedbackContext";

interface UseActionFeedbackOptions {
  successMessage?: string;
  errorMessage?: string;
  confirmMessage?: string;
  requireConfirmation?: boolean;
}

export function useActionFeedback({
  successMessage = "Action completed successfully",
  errorMessage = "Failed to complete action",
  confirmMessage = "Are you sure?",
  requireConfirmation = false,
}: UseActionFeedbackOptions = {}) {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useFeedback();

  const handleAction = async (
    actionFn: () => Promise<void>,
    options: { silent?: boolean } = {}
  ) => {
    if (requireConfirmation && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      await actionFn();
      if (!options.silent) {
        success(successMessage);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : errorMessage;
      if (!options.silent) {
        showError(message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleAction,
  };
}
