'use client'

export default function InteractiveInfographic() {
	return (
		<div className="rounded-lg bg-muted p-6 shadow-md">
			<h2 className="mb-4 text-2xl font-bold">Funding Round Status</h2>
			<div className="flex items-center justify-between">
				<div className="text-center">
					<div className="text-4xl font-bold text-primary">25</div>
					<div className="text-sm text-muted-foreground">
						Proposals Submitted
					</div>
				</div>
				<div className="text-center">
					<div className="text-4xl font-bold text-primary">$500K</div>
					<div className="text-sm text-muted-foreground">
						Total Funding Available
					</div>
				</div>
				<div className="text-center">
					<div className="text-4xl font-bold text-primary">7</div>
					<div className="text-sm text-muted-foreground">Days Remaining</div>
				</div>
			</div>
		</div>
	)
}
