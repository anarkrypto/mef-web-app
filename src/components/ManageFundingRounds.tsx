'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Trash2, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FundingRound {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  topic: {
    id: string;
    name: string;
    reviewerGroups: Array<{
      reviewerGroup: {
        id: string;
        name: string;
      };
    }>;
  };
}

export function ManageFundingRoundsComponent() {
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    try {
      const response = await fetch('/api/admin/funding-rounds');
      if (!response.ok) throw new Error('Failed to fetch funding rounds');
      const data = await response.json();
      setRounds(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load funding rounds",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this funding round?')) return;

    try {
      const response = await fetch(`/api/admin/funding-rounds/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete funding round');

      toast({
        title: "Success",
        description: "Funding round deleted successfully",
      });

      // Refresh rounds list
      fetchRounds();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete funding round",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: FundingRound['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'secondary'
      case 'ACTIVE':
        return 'default'
      case 'DRAFT':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Funding Rounds</h1>
          <p className="text-muted-foreground">
            Select a Round to manage or add a new one.
          </p>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">FUNDING ROUND</TableHead>
                <TableHead>REVIEWERS GROUP</TableHead>
                <TableHead>DISCUSSION TOPIC</TableHead>
                <TableHead>PERIOD</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map((round) => (
                <TableRow key={round.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDelete(round.id)}
                        disabled={round.status === 'ACTIVE'}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete funding round</span>
                      </Button>
                      <span>{round.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {round.topic.reviewerGroups.map((rg) => (
                        <Badge key={rg.reviewerGroup.id} variant="outline">
                          {rg.reviewerGroup.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{round.topic.name}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatPeriod(round.startDate, round.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(round.status)}>
                      {round.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/funding-rounds/${round.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={round.status === 'ACTIVE'}
                      >
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {rounds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No funding rounds found. Create your first funding round.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/admin/funding-rounds/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Funding Round
            </Button>
          </Link>
        </div>

        <div>
          <Link href="/admin">
            <Button variant="secondary">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}