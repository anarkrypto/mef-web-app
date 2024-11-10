'use client'

export default function InteractiveInfographic() {
  return (
    <div className="bg-muted p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Funding Round Status</h2>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">25</div>
          <div className="text-sm text-muted-foreground">Proposals Submitted</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">$500K</div>
          <div className="text-sm text-muted-foreground">Total Funding Available</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">7</div>
          <div className="text-sm text-muted-foreground">Days Remaining</div>
        </div>
      </div>
    </div>
  )
}