'use client'

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, Coins, FileCheck, Vote, Activity, MessageCircle, Bot } from 'lucide-react'
import Link from "next/link"

export function AdminDashboardComponent() {
  const adminOptions = [
    {
      title: "Manage Reviewers",
      description: "Manage Reviewers and Users",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/reviewers"
    },
    {
      title: "Manage Discussion Topics",
      description: "Manage Discussion Topics and Committees.",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/admin/discussions"
    },
    {
      title: "Manage Funding Rounds",
      description: "Manage Funding Rounds and Phases.",
      icon: <Coins className="h-5 w-5" />,
      href: "/admin/funding-rounds"
    },
    {
      title: "Manage Proposal Status",
      description: "Set/Override Proposal Status",
      icon: <FileCheck className="h-5 w-5" />,
      href: "/admin/proposals"
    },
    {
      title: "Count Votes",
      description: "Count Votes for a Funding Round..",
      icon: <Vote className="h-5 w-5" />,
      href: "/admin/votes"
    },
    {
      title: "Worker Heartbeats",
      description: "Monitor background job statuses",
      icon: <Activity className="h-5 w-5" />,
      href: "/admin/worker-heartbeats"
    },
    {
      title: "Consideration OCV Votes",
      description: "Monitor OCV consideration votes",
      icon: <Vote className="h-5 w-5" />,
      href: "/admin/ocv-votes"
    },
    {
      title: "User Feedback",
      description: "View and manage user feedback submissions",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "/admin/feedback"
    },
    {
      title: "GPT Survey Processing",
      description: "Process community feedback with GPT Survey",
      icon: <Bot className="h-5 w-5" />,
      href: "/admin/gpt-survey"
    }
  ]

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the Admin Dashboard. Please select a category to manage
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {adminOptions.map((option, index) => (
            <Link key={index} href={option.href} className="block">
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {option.icon}
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}