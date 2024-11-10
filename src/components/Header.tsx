'use client'

import Link from "next/link"
import { Bell, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { UserStatus } from "./auth/UserStatus"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="hidden font-bold sm:inline-block">MEF</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Home
            </Link>
            <Link href="/start-here" className="transition-colors hover:text-foreground/80 text-foreground">
              Start Here
            </Link>
            <Link href="/proposals" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Proposals
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="mr-6">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <UserStatus />
          </nav>
        </div>
      </div>
    </header>
  )
}
