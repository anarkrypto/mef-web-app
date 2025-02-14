import { Metadata } from 'next'
import { ProposalsList } from '@/components/ProposalsList'

export const metadata: Metadata = {
	title: 'Proposals | MEF',
	description: 'View and manage proposals',
}

export default function ProposalsPage() {
	return <ProposalsList />
}
