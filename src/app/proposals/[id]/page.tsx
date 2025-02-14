import { ProposalDetails } from '@/components/ProposalDetails'

export default async function ProposalPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	return <ProposalDetails proposalId={(await params).id} />
}
