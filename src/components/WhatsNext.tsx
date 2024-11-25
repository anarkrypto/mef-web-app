'use client'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

type Action = {
  title: string
  description: string
  action: string
  route?: string
  implemented: boolean
}

export default function WhatsNext() {
  const router = useRouter()
  
  const actions: Action[] = [
    { 
      title: "Create a proposal", 
      description: "Draft and submit your ideas for consideration.",
      action: "Start creating",
      route: "/proposals/create",
      implemented: true
    },
    { 
      title: "Submit to funding round", 
      description: "Submit your draft proposal to an active funding round.",
      action: "View proposals",
      route: "/proposals",
      implemented: true
    },
    { 
      title: "View active funding rounds", 
      description: "See which funding rounds are currently accepting proposals.",
      action: "View funding rounds",
      route: "/funding-rounds",
      implemented: true
    },
    { 
      title: "Proposal review", 
      description: "Evaluate and provide feedback on community proposals to help them move forward.",
      action: "Start reviewing",
      route: "/proposals/review",
      implemented: false
    },
    { 
      title: "Join the proposal discussion", 
      description: "Engage in conversations about submitted proposals and share your insights.",
      action: "Join discussion",
      route: "/proposals/discussions",
      implemented: false
    },
  ]

  const handleActionClick = (route?: string, implemented: boolean = false) => {
    if (!implemented) {
      return;
    }
    if (route) {
      router.push(route)
    }
  }

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold mb-6">What&apos;s Next</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle>{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button 
                className="w-full group" 
                variant={action.implemented ? "outline" : "secondary"}
                onClick={() => handleActionClick(action.route, action.implemented)}
                disabled={!action.implemented}
              >
                {action.implemented ? action.action : "Coming soon"}
                {action.implemented && (
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
