'use client'

import WhatsNext from '@/components/WhatsNext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StartHereComponent() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to MEF</CardTitle>
              <CardDescription>
                The MEF platform helps manage and coordinate funding rounds for community proposals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You can create proposals, submit them to active funding rounds, and participate in the review process.
                Some features are still under development and will be available soon.
              </p>
            </CardContent>
          </Card>

          <WhatsNext />
        </div>
      </main>
    </div>
  )
}