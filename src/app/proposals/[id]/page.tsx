import { ProposalDetails } from "@/components/ProposalDetails"

export default function ProposalPage({ params }: { params: { id: string } }) {
  return <ProposalDetails proposalId={params.id} />
} 