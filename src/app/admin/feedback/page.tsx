'use client';

import { useState, useEffect, useCallback } from "react";
import { FeedbackList, type FeedbackItem } from "@/components/admin/feedback/FeedbackList";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface FeedbackResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminFeedbackPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  const fetchFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/feedback/list?page=${page}&limit=${limit}&orderBy=${orderBy}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, orderBy, toast]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Icons.loader className="h-6 w-6 animate-spin" />
            <span>Loading feedback...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Icons.messageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Feedback Available</h3>
            <p className="text-sm text-muted-foreground">
              There is no feedback data available at this time.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Feedback</h1>
        <p className="text-muted-foreground mt-2">
          View and manage user feedback submissions. Click on any feedback item to see more details.
        </p>
      </div>

      <FeedbackList
        items={data.items}
        total={data.total}
        page={data.page}
        limit={data.limit}
        totalPages={data.totalPages}
        onPageChange={setPage}
        onOrderChange={setOrderBy}
        onLimitChange={setLimit}
      />
    </div>
  );
} 