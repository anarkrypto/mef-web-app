'use client'

import Header from '@/components/Header'
import InteractiveInfographic from '@/components/InteractiveInfographic'
import WhatsNext from '@/components/WhatsNext'
import FAQ from '../components/FAQ'
import CreateProposalComponent from '@/components/CreateProposal'

export default function CreateProposal() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <CreateProposalComponent />
      </main>
    </div>
  )
}