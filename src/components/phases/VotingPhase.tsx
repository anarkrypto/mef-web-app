import { Card, CardContent } from "@/components/ui/card"

export function VotingPhase() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🗳️</div>
          <h3 className="text-xl font-semibold">Voting Phase</h3>
          <p className="text-muted-foreground">
            The voting phase functionality is currently under development. 
            Soon you&apos;ll be able to vote on proposals here!
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 
