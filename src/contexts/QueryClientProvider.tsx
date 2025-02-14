'use client'

import { ReactNode } from 'react'
import {
	QueryClient,
	QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export function QueryClientProvider({ children }: { children: ReactNode }) {
	return (
		<TanStackQueryClientProvider client={queryClient}>
			{children}
		</TanStackQueryClientProvider>
	)
}
