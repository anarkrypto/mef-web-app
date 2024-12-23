import RankedVoteList from '@/components/voting-phase/RankedVoteList'

const proposals = [
  { id: 1, name: 'Disability Rights Education and Defense Fund (DREDF)' },
  { id: 2, name: 'ElectronicFrontierFoundation' },
  { id: 3, name: 'MSF' },
  { id: 4, name: 'MAGinternational' },
  { id: 5, name: 'Open Arms' },
  { id: 6, name: 'Happy Doggo' },
  { id: 7, name: 'Save the Children' },
  { id: 8, name: 'Darussfaka Funding' },
  { id: 9, name: 'Fundacion Mona' },
  { id: 10, name: 'Conservation Fund' },
  { id: 11, name: 'World Wildlife Fund' },
  { id: 12, name: 'Amnesty International' },
  { id: 13, name: 'UNICEF' },
  { id: 14, name: 'Red Cross' },
]

export default function VotingPage() {
  const handleSubmit = (selectedProposals: any[]) => {
    console.log('Selected proposals:', selectedProposals)
  }

  const handleSaveToMemo = (selectedProposals: any[]) => {
    console.log('Saving to memo:', selectedProposals)
  }

  const handleConnectWallet = () => {
    console.log('Connecting wallet...')
  }

  return (
    <RankedVoteList 
      proposals={proposals}
      onSubmit={handleSubmit}
      onSaveToMemo={handleSaveToMemo}
      onConnectWallet={handleConnectWallet}
      title="Rank your vote"
    />
  )
}

