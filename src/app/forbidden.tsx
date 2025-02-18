import { ErrorCard } from '@/components/ErrorCard'
import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

export default function Forbidden() {
	return (
		<div className="flex h-full flex-1 flex-col items-center justify-center p-4">
			<ErrorCard
				title="Forbidden"
				message="You don't have permission to access this resource"
			/>
			<Link className="mt-8 text-secondary" href="/">
				<Button variant="secondary">
					<HomeIcon className="mr-1 h-4 w-4" />
					Return Home
				</Button>
			</Link>
		</div>
	)
}
