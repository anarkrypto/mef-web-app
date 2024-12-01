import { Card, CardContent } from "@/components/ui/card"

export function DeliberationPhase() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="text-4xl">🚧</div>
          <h3 className="text-xl font-semibold">Deliberation Phase</h3>
          <p className="text-muted-foreground">
            The deliberation phase functionality is currently under development. 
            Stay tuned for updates!
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 
