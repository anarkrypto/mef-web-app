import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from '@/components/Header'
import { ThemeProvider } from "@/components/theme-provider"
import { FeedbackProvider } from "@/contexts/FeedbackContext"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext"
import { WalletProvider } from "@/contexts/WalletContext"
import { Suspense } from "react";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Home | MEF",
  description: "A platform for managing and coordinating funding rounds for community proposals. Create, submit, and review proposals in a transparent and organized way.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
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
  );
}
