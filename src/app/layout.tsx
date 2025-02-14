import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { ThemeProvider } from '@/components/theme-provider'
import { FeedbackProvider } from '@/contexts/FeedbackContext'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { Suspense } from 'react'
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog'
import { IBM_Plex_Sans as FontSans } from 'next/font/google'

export const metadata: Metadata = {
	title: 'Home | MEF',
	description:
		'A platform for managing and coordinating funding rounds for community proposals. Create, submit, and review proposals in a transparent and organized way.',
}

const fontSans = FontSans({
	subsets: ['latin'],
	variable: '--font-sans',
	weight: ['100', '200', '300', '400', '500', '600', '700'],
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${fontSans.className} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
				>
					<FeedbackProvider>
						<Suspense fallback={<div>Loading...</div>}>
							<AuthProvider>
								<WalletProvider>
									<Header />
									<main>{children}</main>
									<Toaster />
									<FeedbackDialog />
								</WalletProvider>
							</AuthProvider>
						</Suspense>
					</FeedbackProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
