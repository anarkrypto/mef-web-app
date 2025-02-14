import { ManageProposalsComponent } from '@/components/admin/ManageProposals'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Manage Proposals | MEF Admin',
	description: 'Manage proposal statuses and funding round assignments',
}

export default function ManageProposalsPage() {
	return <ManageProposalsComponent />
}
