import { Metadata } from 'next'
import { StartHereContent } from '@/components/start-here/StartHereContent'

export const metadata: Metadata = {
  title: 'Start Here - MINA Ecosystem Funding',
  description: 'Learn about the MINA Ecosystem Funding proposal process and get started with your proposal journey.',
}

export default function StartHerePage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 min-h-[calc(100vh-4rem)]">
      <StartHereContent />
    </div>
  )
}
