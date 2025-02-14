import { ManageReviewersComponent } from '@/components/ManageReviewers'
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Manage Reviewers | MEF Admin',
	description: 'Manage reviewers and reviewer groups',
}

export default function ManageReviewersPage() {
	return <ManageReviewersComponent />
}
