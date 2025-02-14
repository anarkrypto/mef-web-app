'use client'

import React, { createContext, useContext } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { ToastActionElement } from '@/components/ui/toast'

interface FeedbackOptions {
	action?: ToastActionElement
	duration?: number
}

interface FeedbackContextType {
	success: (message: string, options?: FeedbackOptions) => void
	error: (message: string, options?: FeedbackOptions) => void
	warning: (message: string, options?: FeedbackOptions) => void
	info: (message: string, options?: FeedbackOptions) => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(
	undefined,
)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
	const { toast } = useToast()

	const success = (message: string, options?: FeedbackOptions) => {
		toast({
			description: message,
			action: options?.action,
			duration: options?.duration || 3000,
		})
	}

	const error = (message: string, options?: FeedbackOptions) => {
		toast({
			description: message,
			variant: 'destructive',
			action: options?.action,
			duration: options?.duration || 5000,
		})
	}

	const warning = (message: string, options?: FeedbackOptions) => {
		toast({
			title: 'Warning',
			description: message,
			action: options?.action,
			duration: options?.duration || 4000,
		})
	}

	const info = (message: string, options?: FeedbackOptions) => {
		toast({
			description: message,
			action: options?.action,
			duration: options?.duration || 4000,
		})
	}

	return (
		<FeedbackContext.Provider value={{ success, error, warning, info }}>
			{children}
		</FeedbackContext.Provider>
	)
}

export const useFeedback = () => {
	const context = useContext(FeedbackContext)
	if (context === undefined) {
		throw new Error('useFeedback must be used within a FeedbackProvider')
	}
	return context
}
