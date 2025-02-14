import { ManageReviewerGroupComponent } from '@/components/ManageReviewerGroup'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Manage Reviewer Group | MEF Admin',
	description: 'Create or edit reviewer groups',
}

interface PageProps {
	params: Promise<{
		id: string
	}>
}

export default async function ManageReviewerGroupPage({ params }: PageProps) {
	return (
		<ManageReviewerGroupComponent
			groupId={(await params).id === 'new' ? null : (await params).id}
		/>
	)
}
