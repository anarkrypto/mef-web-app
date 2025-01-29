'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ProcessVisualization } from './ProcessVisualization'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightIcon, Loader2Icon } from 'lucide-react'
import type { FundingRound } from '@prisma/client'
import { cn } from '@/lib/utils'

interface FundingRoundWithPhases extends FundingRound {
  submissionPhase: {
    startDate: Date;
    endDate: Date;
  };
  considerationPhase: {
    startDate: Date;
    endDate: Date;
  };
  deliberationPhase: {
    startDate: Date;
    endDate: Date;
  };
  votingPhase: {
    startDate: Date;
    endDate: Date;
  };
}

export function StartHereContent() {
  const router = useRouter()
  const [activeFundingRounds, setActiveFundingRounds] = useState<FundingRoundWithPhases[]>([])
  const [selectedRound, setSelectedRound] = useState<string>('')
  const [currentPhase, setCurrentPhase] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveFundingRounds() {
      try {
        const response = await fetch('/api/funding-rounds/active')
        if (!response.ok) throw new Error('Failed to fetch active funding rounds')
        const data = await response.json()
        setActiveFundingRounds(data)
        if (data.length > 0) {
          setSelectedRound(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching active funding rounds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveFundingRounds()
  }, [])

  useEffect(() => {
    if (selectedRound && activeFundingRounds.length > 0) {
      const round = activeFundingRounds.find(r => r.id === selectedRound)
      if (round) {
        const now = new Date()

        if (now >= new Date(round.submissionPhase.startDate) && 
            now <= new Date(round.submissionPhase.endDate)) {
          setCurrentPhase('submission')
        } else if (now >= new Date(round.considerationPhase.startDate) && 
                   now <= new Date(round.considerationPhase.endDate)) {
          setCurrentPhase('consideration')
        } else if (now >= new Date(round.deliberationPhase.startDate) && 
                   now <= new Date(round.deliberationPhase.endDate)) {
          setCurrentPhase('deliberation')
        } else if (now >= new Date(round.votingPhase.startDate) && 
                   now <= new Date(round.votingPhase.endDate)) {
          setCurrentPhase('voting')
        } else if (now > new Date(round.endDate)) {
          setCurrentPhase('completed')
        } else {
          setCurrentPhase('upcoming')
        }
      }
    }
  }, [selectedRound, activeFundingRounds])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2Icon className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading funding rounds...</p>
      </div>
    )
  }

  if (activeFundingRounds.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>No Active Funding Rounds</CardTitle>
          <CardDescription>
            There are currently no active funding rounds. Please check back later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const selectedRoundData = activeFundingRounds.find(r => r.id === selectedRound)

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Start Here</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Welcome to the MINA Ecosystem Funding process. Here you can learn about the different phases
            and get started with your proposal journey.
          </p>
        </div>

        {activeFundingRounds.length > 1 && (
          <div className="flex justify-center">
            <Select
              value={selectedRound}
              onValueChange={setSelectedRound}
            >
              <SelectTrigger className="w-[320px]">
                <SelectValue placeholder="Select a funding round" />
              </SelectTrigger>
              <SelectContent>
                {activeFundingRounds.map((round) => (
                  <SelectItem 
                    key={round.id} 
                    value={round.id}
                    className="py-3"
                  >
                    <div className="flex flex-col">
                      <span>{round.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(round.startDate).toLocaleDateString()} - {new Date(round.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {selectedRoundData && (
        <>
          {/* Process Visualization */}
          <div className="bg-card rounded-xl border shadow-sm p-8">
            <ProcessVisualization
              currentPhase={currentPhase}
              fundingRound={selectedRoundData}
            />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">📝</span> Create a Proposal
                </CardTitle>
                <CardDescription>
                  Start your journey by creating a new proposal for the MINA ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => router.push('/proposals/create')}
                  className="w-full"
                >
                  Create Proposal <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className={cn(
              "transition-all duration-200 hover:shadow-md",
              currentPhase === 'submission' && "border-primary shadow-sm"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🔍</span> Check Proposals
                </CardTitle>
                <CardDescription>
                  View and review submitted proposals in the current funding round
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="secondary"
                  onClick={() => router.push(`/`)}
                  className="w-full"
                >
                  View Proposals <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">📊</span> Phase Summary
                </CardTitle>
                <CardDescription>
                  Get a detailed overview of the current phase and its progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/funding-rounds/${selectedRound}/summaries`)}
                  className="w-full"
                >
                  View Summary <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
} 