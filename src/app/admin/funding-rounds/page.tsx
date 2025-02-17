import { ManageFundingRoundsComponent } from '@/components/ManageFundingRounds'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Manage Funding Rounds | MEF Admin',
	description: 'Manage funding rounds and phases',
}

export default function ManageFundingRoundsPage() {
	return <ManageFundingRoundsComponent />
}
