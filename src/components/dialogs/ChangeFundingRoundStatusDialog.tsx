'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

type FundingRoundStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: FundingRoundStatus;
  roundName: string;
  roundId: string;
  onStatusChange: () => Promise<void>;
}

const statusOptions: { value: FundingRoundStatus; label: string; icon: string }[] = [
  { value: 'DRAFT', label: 'Draft', icon: '📝' },
  { value: 'ACTIVE', label: 'Active', icon: '🟢' },
  { value: 'COMPLETED', label: 'Completed', icon: '✅' },
  { value: 'CANCELLED', label: 'Cancelled', icon: '❌' },
];

export function ChangeFundingRoundStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  roundName,
  roundId,
  onStatusChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FundingRoundStatus>(currentStatus);
  const { toast } = useToast();

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      onOpenChange(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/funding-rounds/${roundId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: "Status Updated",
        description: `Funding round status changed to ${selectedStatus.toLowerCase()}`,
      });

      await onStatusChange();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update funding round status",
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
          <DialogTitle>Update Funding Round Status</DialogTitle>
          <DialogDescription>
            Change the status of funding round <strong>{roundName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge variant="outline">
                {statusOptions.find(s => s.value === currentStatus)?.icon} {currentStatus}
              </Badge>
            </div>
            
            <Select
              value={selectedStatus}
              onValueChange={(value: FundingRoundStatus) => setSelectedStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem 
                    key={status.value} 
                    value={status.value}
                    disabled={status.value === currentStatus}
                  >
                    <span className="flex items-center gap-2">
                      {status.icon} {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus === 'ACTIVE' && currentStatus === 'DRAFT' && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              ℹ️ Activating a funding round will:
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Lock the round configuration</li>
                <li>Start accepting proposal submissions</li>
                <li>Begin the consideration phase</li>
              </ul>
            </div>
          )}

          {selectedStatus === 'CANCELLED' && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              ⚠️ Cancelling a funding round cannot be undone
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            disabled={loading || selectedStatus === currentStatus}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 