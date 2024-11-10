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
}

export default function WhatsNext() {
  const router = useRouter()
  
  const actions: Action[] = [
    { 
      title: "Create a proposal", 
      description: "Draft and submit your ideas for consideration.",
      action: "Start creating",
      route: "/proposals/create"
    },
    { 
      title: "Check submitted proposals", 
      description: "Review proposals from the community or submit your own to the active funding round.",
      action: "View proposals",
      route: "/proposals"
    },
    { 
      title: "See a summary", 
      description: "Get an overview of previous funding phases and outcomes.",
      action: "View summary",
      route: "/summary"
    },
    { 
      title: "Proposal review", 
      description: "Evaluate and provide feedback on community proposals to help them move forward.",
      action: "Start reviewing",
      route: "/proposals/review"
    },
    { 
      title: "Join the proposal discussion", 
      description: "Engage in conversations about submitted proposals and share your insights.",
      action: "Join discussion",
      route: "/proposals/discussions"
    },
  ]

  const handleActionClick = (route?: string) => {
    if (route) {
      router.push(route)
    }
  }

  return (
    <div className="my-8">
      <h2 className="text-3xl font-bold mb-6">What's Next</h2>
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
                variant="outline"
                onClick={() => handleActionClick(action.route)}
              >
                {action.action}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
