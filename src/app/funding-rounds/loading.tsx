export function FundingRoundsSkeleton() {
	return (
		<div>
			<div className="mb-8 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-[#2D2D2D]">Funding Rounds</h1>
				<div className="flex gap-4">
					<div className="h-10 w-20 animate-pulse rounded-md bg-muted md:w-24" />
				</div>
			</div>

			<div className="flex flex-col gap-6">
				{new Array(2).fill('').map((_, index) => (
					<div
						key={index}
						className="flex h-40 w-full animate-pulse gap-6 rounded-md bg-muted"
					/>
				))}
			</div>
		</div>
	)
}

export default FundingRoundsSkeleton
