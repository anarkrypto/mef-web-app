'use client'

import { Icons } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface AdminOption {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  href: string;
  color?: string;
}

const adminOptions: AdminOption[] = [
  {
    title: "Manage Reviewers",
    description: "Manage Reviewers and Users",
    icon: "users",
    href: "/admin/reviewers",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Manage Discussion Topics",
    description: "Manage Discussion Topics and Committees",
    icon: "messageSquare",
    href: "/admin/topics",
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Manage Funding Rounds",
    description: "Manage Funding Rounds and Phases",
    icon: "link",
    href: "/admin/funding-rounds",
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Manage Proposal Status",
    description: "Set/Override Proposal Status",
    icon: "fileText",
    href: "/admin/proposals",
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Count Votes",
    description: "Count Votes for a Funding Round",
    icon: "barChart",
    href: "/admin/votes",
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    title: "Worker Heartbeats",
    description: "Monitor background job statuses",
    icon: "activity",
    href: "/admin/workers",
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Consideration OCV Votes",
    description: "Monitor OCV consideration votes",
    icon: "barChart2",
    href: "/admin/ocv-votes",
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    title: "User Feedback",
    description: "View and manage user feedback submissions",
    icon: "messageCircle",
    href: "/admin/feedback",
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "GPT Survey Processing",
    description: "Process community feedback with GPT Survey",
    icon: "messageSquare",
    href: "/admin/gpt-survey",
    color: "bg-teal-500/10 text-teal-500",
  }
];

export function AdminDashboardComponent() {
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Admin Dashboard. Please select a category to manage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminOptions.map((option) => {
          const Icon = Icons[option.icon];
          return (
            <Link key={option.href} href={option.href}>
              <Card className="h-full p-6 hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold tracking-tight">
                        {option.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}