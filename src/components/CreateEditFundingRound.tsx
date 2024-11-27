'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { validatePhaseDates } from "@/lib/validation"

interface Topic {
  id: string;
  name: string;
  reviewerGroups: Array<{
    reviewerGroup: {
      id: string;
      name: string;
    };
  }>;
}

interface FundingRound {
  id: string;
  name: string;
  description: string;
  topic: Topic;
  totalBudget: number;
  startDate: string;
  endDate: string;
  submissionPhase: {
    startDate: string;
    endDate: string;
  };
  considerationPhase: {
    startDate: string;
    endDate: string;
  };
  deliberationPhase: {
    startDate: string;
    endDate: string;
  };
  votingPhase: {
    startDate: string;
    endDate: string;
  };
}

type DatePhase = {
  key: 'fundingRoundDates' | 'submissionDates' | 'considerationDates' | 'deliberationDates' | 'votingDates';
  label: string;
};

const DATE_PHASES: DatePhase[] = [
  { key: 'fundingRoundDates', label: "Funding Round Period" },
  { key: 'submissionDates', label: "Submission Phase (UTC)" },
  { key: 'considerationDates', label: "Consideration Phase (UTC)" },
  { key: 'deliberationDates', label: "Deliberation Phase (UTC)" },
  { key: 'votingDates', label: "Voting Phase (UTC)" }
];

export function AddEditFundingRoundComponent({ 
  roundId 
}: { 
  roundId: string | null 
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    totalBudget: "",
    selectedTopic: null as Topic | null,
    fundingRoundDates: { from: null as Date | null, to: null as Date | null },
    submissionDates: { from: null as Date | null, to: null as Date | null },
    considerationDates: { from: null as Date | null, to: null as Date | null },
    deliberationDates: { from: null as Date | null, to: null as Date | null },
    votingDates: { from: null as Date | null, to: null as Date | null },
  });

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        // Fetch available topics
        const topicsResponse = await fetch('/api/admin/discussion-topics');
        if (!topicsResponse.ok) throw new Error('Failed to fetch topics');
        const topicsData = await topicsResponse.json();
        setTopics(topicsData);

        // If editing, fetch funding round data
        if (roundId && roundId !== 'new') {
          const roundResponse = await fetch(`/api/admin/funding-rounds/${roundId}`);
          if (!roundResponse.ok) throw new Error('Failed to fetch funding round');
          const round: FundingRound = await roundResponse.json();

          // Check for missing phases and show warnings
          const missingPhases = [];
          if (!round.submissionPhase) missingPhases.push('Submission');
          if (!round.considerationPhase) missingPhases.push('Consideration');
          if (!round.deliberationPhase) missingPhases.push('Deliberation');
          if (!round.votingPhase) missingPhases.push('Voting');

          if (missingPhases.length > 0) {
            toast({
              title: "⚠️ Warning",
              description: `Missing phase data for: ${missingPhases.join(', ')}. Please set the dates manually.`,
              variant: "default",
            });
          }
          
          setFormData({
            name: round.name,
            description: round.description,
            totalBudget: round.totalBudget.toString(),
            selectedTopic: round.topic,
            fundingRoundDates: {
              from: new Date(round.startDate),
              to: new Date(round.endDate),
            },
            submissionDates: round.submissionPhase ? {
              from: new Date(round.submissionPhase.startDate),
              to: new Date(round.submissionPhase.endDate),
            } : { from: null, to: null },
            considerationDates: round.considerationPhase ? {
              from: new Date(round.considerationPhase.startDate),
              to: new Date(round.considerationPhase.endDate),
            } : { from: null, to: null },
            deliberationDates: round.deliberationPhase ? {
              from: new Date(round.deliberationPhase.startDate),
              to: new Date(round.deliberationPhase.endDate),
            } : { from: null, to: null },
            votingDates: round.votingPhase ? {
              from: new Date(round.votingPhase.startDate),
              to: new Date(round.votingPhase.endDate),
            } : { from: null, to: null },
          });
        }
      } catch (error) {
        console.error('Data loading error:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [roundId, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTopicSelect = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    setFormData(prev => ({ ...prev, selectedTopic: topic || null }));
  };

  const handleDateChange = (
    phase: DatePhase['key'],
    type: 'from' | 'to',
    date: Date | null
  ) => {
    setFormData(prev => {
      const dates = prev[phase];
      if (!dates || typeof dates !== 'object' || !('from' in dates) || !('to' in dates)) {
        return prev;
      }
  
      return {
        ...prev,
        [phase]: {
          ...dates,
          [type]: date,
        },
      };
    });
  }; 

  const validateForm = () => {
    if (!formData.selectedTopic) {
      toast({
        title: "Error",
        description: "Please select a topic",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.name || !formData.description || !formData.totalBudget) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    // Check if all dates are set
    const dateFields = [
      'fundingRoundDates',
      'submissionDates',
      'considerationDates',
      'deliberationDates',
      'votingDates',
    ] as const;

    for (const field of dateFields) {
      if (!formData[field].from || !formData[field].to) {
        toast({
          title: "Error",
          description: `Please set both dates for ${field.replace('Dates', '')}`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Type guard to ensure all dates are non-null
    const allDatesPresent = 
      formData.fundingRoundDates.from && 
      formData.fundingRoundDates.to &&
      formData.submissionDates.from && 
      formData.submissionDates.to &&
      formData.considerationDates.from && 
      formData.considerationDates.to &&
      formData.deliberationDates.from && 
      formData.deliberationDates.to &&
      formData.votingDates.from && 
      formData.votingDates.to;

    if (!allDatesPresent) {
      toast({
        title: "Error",
        description: "All dates must be set",
        variant: "destructive",
      });
      return false;
    }

    // Now we can safely validate the dates
    const datesValid = validatePhaseDates({
      fundingRound: {
        from: formData.fundingRoundDates.from as Date,
        to: formData.fundingRoundDates.to as Date,
      },
      submission: {
        from: formData.submissionDates.from as Date,
        to: formData.submissionDates.to as Date,
      },
      consideration: {
        from: formData.considerationDates.from as Date,
        to: formData.considerationDates.to as Date,
      },
      deliberation: {
        from: formData.deliberationDates.from as Date,
        to: formData.deliberationDates.to as Date,
      },
      voting: {
        from: formData.votingDates.from as Date,
        to: formData.votingDates.to as Date,
      },
    });

    if (!datesValid.valid) {
      toast({
        title: "Error",
        description: datesValid.error,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const endpoint = roundId 
        ? `/api/admin/funding-rounds/${roundId}`
        : '/api/admin/funding-rounds';
      
      const method = roundId ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          topicId: formData.selectedTopic!.id,
          totalBudget: parseFloat(formData.totalBudget),
          fundingRoundDates: {
            from: formData.fundingRoundDates.from!.toISOString(),
            to: formData.fundingRoundDates.to!.toISOString(),
          },
          submissionDates: {
            from: formData.submissionDates.from!.toISOString(),
            to: formData.submissionDates.to!.toISOString(),
          },
          considerationDates: {
            from: formData.considerationDates.from!.toISOString(),
            to: formData.considerationDates.to!.toISOString(),
          },
          deliberationDates: {
            from: formData.deliberationDates.from!.toISOString(),
            to: formData.deliberationDates.to!.toISOString(),
          },
          votingDates: {
            from: formData.votingDates.from!.toISOString(),
            to: formData.votingDates.to!.toISOString(),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to save funding round');

      toast({
        title: "Success",
        description: `Funding round ${roundId ? 'updated' : 'created'} successfully`,
      });

      router.push('/admin/funding-rounds');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save funding round",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!roundId) return;
    
    if (!confirm('Are you sure you want to delete this funding round?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/funding-rounds/${roundId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete funding round');

      toast({
        title: "Success",
        description: "Funding round deleted successfully",
      });

      router.push('/admin/funding-rounds');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete funding round",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {roundId && roundId !== 'new' ? 'Edit Funding Round' : 'Create Funding Round'}
          </h1>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <Label htmlFor="name">Funding Round Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter funding round name"
              className="bg-muted"
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter funding round description"
              className="bg-muted min-h-[100px]"
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="totalBudget">Total Budget</Label>
            <Input
              id="totalBudget"
              name="totalBudget"
              type="number"
              value={formData.totalBudget}
              onChange={handleInputChange}
              placeholder="Enter total budget"
              className="bg-muted"
              disabled={loading}
            />
          </div>

          {/* Topic Selection */}
          <div className="space-y-4">
            <Label>Discussion Topic</Label>
            <Select
              value={formData.selectedTopic?.id}
              onValueChange={handleTopicSelect}
              disabled={loading}
            >
              <SelectTrigger className="bg-muted">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selections */}
{DATE_PHASES.map((phase) => {
  const dates = formData[phase.key];
  if (!dates || typeof dates !== 'object' || !('from' in dates) || !('to' in dates)) {
    return null;
  }

  return (
    <div key={phase.key} className="grid gap-4">
      <Label>{phase.label}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-muted",
                  !dates.from && "text-muted-foreground"
                )}
              >
                {dates.from ? (
                  format(dates.from, "PPP HH:mm 'UTC'")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
  mode="single"
  selected={dates.from || undefined}  // Convert null to undefined
  onSelect={(date) => handleDateChange(phase.key, 'from', date || null)}  // Handle undefined
  disabled={loading}
                initialFocus
              />
              <div className="p-3 border-t">
                <Input
                  type="time"
                  onChange={(e) => {
                    if (dates.from) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(dates.from);
                      newDate.setUTCHours(parseInt(hours), parseInt(minutes));
                      handleDateChange(phase.key, 'from', newDate);
                    }
                  }}
                  disabled={loading}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-muted",
                  !dates.to && "text-muted-foreground"
                )}
              >
                {dates.to ? (
                  format(dates.to, "PPP HH:mm 'UTC'")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
  mode="single"
  selected={dates.to || undefined}  // Convert null to undefined
  onSelect={(date) => handleDateChange(phase.key, 'to', date || null)}  // Handle undefined
  disabled={loading}
  initialFocus
/>
              <div className="p-3 border-t">
                <Input
                  type="time"
                  onChange={(e) => {
                    if (dates.to) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(dates.to);
                      newDate.setUTCHours(parseInt(hours), parseInt(minutes));
                      handleDateChange(phase.key, 'to', newDate);
                    }
                  }}
                  disabled={loading}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
              );
            })}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            {roundId && roundId !== 'new' && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Funding Round
              </Button>
            )}
            <div className="flex gap-4 ml-auto">
              <Link href="/admin/funding-rounds">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Funding Round'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}