'use client'

import Header from '@/components/Header'
import InteractiveInfographic from '@/components/InteractiveInfographic'
import WhatsNext from '@/components/WhatsNext'
import FAQ from '../components/FAQ'

export default function StartHereComponent() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Here is what you have missed</h1>
        <InteractiveInfographic />
        <WhatsNext />
        <FAQ />
      </main>
    </div>
  )
}