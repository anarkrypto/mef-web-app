import { ProposalEditForm } from "@/components/ProposalEditForm"
import type { Metadata } from 'next'
import { use } from 'react'

interface Props {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: 'Edit Proposal | MEF',
  description: 'Edit your proposal'
}

export default function EditProposalPage({ params }: Props) {
  // Unwrap the params promise using React.use()
  const { id } = use(params)

  // Validate id is present
  if (!id) {
    throw new Error('Proposal ID is required')
  }

  return <ProposalEditForm proposalId={id} />
} 